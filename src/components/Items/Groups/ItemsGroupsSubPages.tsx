import { Space, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { ItemGroup, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { ItemsGroupsByGroupTable } from './ItemsGroupsByGroupTable';
import { ItemsGroupsByItemTable } from './ItemsGroupsByItemTable';
import { ItemsGroupsSearch } from './ItemsGroupsSearch';

export function ItemsGroupsSubPages({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<ItemGroup>) {
  const { is, queryParams } = useQueryParams();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const grousByItem = useMemo(() => {
    return Object.values(data ?? []).reduce((acc: Record<string, string[]>, group) => {
      if (!group.itemsIds) {
        console.warn('Group without items', group);
      }
      group.itemsIds.forEach((itemId) => {
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push(group.id);
      });

      return acc;
    }, {});
  }, [data]);

  const groupsTypeahead = useMemo(
    () =>
      orderBy(
        Object.values(data).flatMap(({ id, name }) => [{ label: `${name.en} [${id}]`, value: id }]),
        'label',
      ),
    [data],
  );

  const onUpdateItemGroups = (itemId: string, groupIds: string[]) => {
    // Compare previous groups in items with new groups
    const previousGroups = grousByItem[itemId] ?? [];
    const groupsToAdd = groupIds.filter((id) => !previousGroups.includes(id));
    const groupsToRemove = previousGroups.filter((id) => !groupIds.includes(id));

    // Add item to groups
    groupsToAdd.forEach((groupId) => {
      const group = data[groupId];
      addEntryToUpdate(groupId, {
        ...group,
        itemsIds: removeDuplicates([...(group?.itemsIds ?? []), itemId]),
      });
    });

    // Remove item from groups
    groupsToRemove.forEach((groupId) => {
      const group = data[groupId];
      addEntryToUpdate(groupId, {
        ...group,
        itemsIds: removeDuplicates(group?.itemsIds.filter((id) => id !== itemId)),
      });
    });
  };

  const onUpdateGroupItems = (groupId: string, itemIds: string[]) => {
    const group = data[groupId];
    addEntryToUpdate(groupId, {
      ...group,
      itemsIds: removeDuplicates(itemIds),
    });
  };

  const onUpdateName = (name: string, language: 'en' | 'pt', groupId: string) => {
    const group = data[groupId];
    addEntryToUpdate(groupId, {
      ...group,
      name: {
        ...group.name,
        [language]: name,
      },
    });
  };

  return (
    <>
      {(is('display', 'group') || !queryParams.has('display')) && (
        <Space direction="vertical" className="mb-4">
          <ItemsGroupsSearch
            data={data}
            items={itemsTypeaheadQuery.data}
            grousByItem={grousByItem}
            groupsTypeahead={groupsTypeahead}
            onUpdateItemGroups={onUpdateItemGroups}
            onUpdateGroupItems={onUpdateGroupItems}
            onUpdateName={onUpdateName}
          />
          <Typography.Title level={2}>Groups ({Object.keys(data).length})</Typography.Title>
          <ItemsGroupsByGroupTable
            rows={Object.values(data)}
            items={itemsTypeaheadQuery.data}
            grousByItem={grousByItem}
            groupsTypeahead={groupsTypeahead}
            onUpdateItemGroups={onUpdateItemGroups}
            onUpdateGroupItems={onUpdateGroupItems}
            onUpdateName={onUpdateName}
          />
        </Space>
      )}
      {is('display', 'item') && (
        <ItemsGroupsByItemTable
          items={itemsTypeaheadQuery.data}
          grousByItem={grousByItem}
          groupsTypeahead={groupsTypeahead}
          onUpdateItemGroups={onUpdateItemGroups}
          onUpdateGroupItems={onUpdateGroupItems}
          onUpdateName={onUpdateName}
        />
      )}
    </>
  );
}
