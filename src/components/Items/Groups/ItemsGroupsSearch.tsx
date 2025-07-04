import { Space, Typography } from 'antd';
import { Typeahead } from 'components/Common/Typeahead';
import { useMemo, useState } from 'react';
import type { ItemGroup, Item as ItemT } from 'types';
import { ItemsGroupsByGroupTable } from './ItemsGroupsByGroupTable';

type ItemsGroupsSearchProps = {
  data: Dictionary<ItemGroup>;
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
  onUpdateName: (name: string, language: 'en' | 'pt', groupId: string) => void;
};

export function ItemsGroupsSearch({
  data,
  items,
  grousByItem,
  groupsTypeahead,
  onUpdateItemGroups,
  onUpdateGroupItems,
  onUpdateName,
}: ItemsGroupsSearchProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return data[activeGroupId];
  }, [activeGroupId, data]);
  return (
    <Space direction="vertical">
      <Typography.Title level={5}>Search Groups</Typography.Title>

      <Typeahead
        data={data}
        onFinish={(id) => setActiveGroupId(id)}
        parser={typeaheadParser}
        placeholder="Search group by name..."
        style={{ width: '100%', minWidth: 450 }}
      />

      {!!activeGroup && (
        <ItemsGroupsByGroupTable
          groupsTypeahead={groupsTypeahead}
          grousByItem={grousByItem}
          items={items}
          onUpdateGroupItems={onUpdateGroupItems}
          onUpdateItemGroups={onUpdateItemGroups}
          onUpdateName={onUpdateName}
          rows={[activeGroup]}
        />
      )}
    </Space>
  );
}

const typeaheadParser = (data: Record<string, ItemGroup>) => {
  return Object.values(data ?? {}).reduce((acc: Record<string, string>, group) => {
    acc[`${group.name.en}`] = group.id;
    acc[`${group.name.pt}`] = group.id;
    return acc;
  }, {});
};
