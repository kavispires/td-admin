import { Button, Drawer, Flex, Select, Space, Switch, Tag, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { Item } from 'components/Sprites';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { isEqual } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyDiscSet, Item as ItemT } from 'types';

type OrphanItemsProps = Pick<UseResourceFirestoreDataReturnType<DailyDiscSet>, 'data' | 'addEntryToUpdate'>;

export function OrphanItems({ data, addEntryToUpdate }: OrphanItemsProps) {
  const { is, addParam } = useQueryParams();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const [itemsSets, orphans]: [Record<string, string[]>, ItemT[]] = useMemo(() => {
    if (itemsTypeaheadQuery.data) {
      const itemsDict = Object.values(data).reduce((acc: Record<string, string[]>, discSet) => {
        discSet.itemsIds.forEach((itemId) => {
          if (!acc[itemId]) {
            acc[itemId] = [];
          }
          acc[itemId].push(discSet.id);
        });
        return acc;
      }, {});

      Object.keys(itemsTypeaheadQuery.data).reduce((acc: Record<string, string[]>, itemId) => {
        if (acc[itemId] === undefined) {
          acc[itemId] = [];
        }
        acc[itemId].push(itemId);
        return acc;
      }, {});

      const colorSetIds = [
        'black',
        'blue',
        'brown',
        'green',
        'orange',
        'pink',
        'purple',
        'red',
        'white',
        'yellow',
      ];
      const orphanItems = Object.keys(itemsTypeaheadQuery.data)
        .filter(
          (itemId) =>
            itemsDict[itemId] === undefined ||
            (itemsDict[itemId].length === 1 && colorSetIds.includes(itemsDict[itemId][0])),
        )
        .map((itemId) => itemsTypeaheadQuery.data[itemId]);

      return [itemsDict, orphanItems];
    }
    return [{}, []];
  }, [data, itemsTypeaheadQuery.data]);

  const onlyOrphans = is('onlyOrphans');

  const { page, pagination } = useGridPagination({
    data: onlyOrphans ? orphans : Object.values(itemsTypeaheadQuery.data),
    defaultPageSize: 64,
    resetter: onlyOrphans ? 'orphans' : 'all',
  });

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [latestSetId, setLatestSetId] = useState<string | null>(null);

  const sortedSets = useMemo(
    () => Object.values(data).sort((a, b) => a.title.pt.localeCompare(b.title.pt)),
    [data],
  );

  return (
    <>
      <Typography.Title level={4}>Orphan Items ({orphans.length})</Typography.Title>
      <Space className="mb-4">
        <Switch
          checkedChildren="Only Orphans"
          onChange={(value) => addParam('onlyOrphans', value, false)}
          unCheckedChildren="All Items"
        />
      </Space>

      <Drawer onClose={() => setActiveItem(null)} open={!!activeItem} title="Add Item to Set">
        {!!activeItem && (
          <DrawerContent
            activeItem={activeItem}
            activeItemSets={itemsSets?.[activeItem] ?? []}
            addEntryToUpdate={addEntryToUpdate}
            data={data}
            latestSetId={latestSetId}
            setLatestSetId={setLatestSetId}
            sortedSets={sortedSets}
          />
        )}
      </Drawer>
      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <TransparentButton key={item.id} onClick={() => setActiveItem(item.id)}>
              <Item itemId={item.id} />
            </TransparentButton>
          ))}
        </Flex>
      </PaginationWrapper>
    </>
  );
}

type DrawerContentProps = {
  activeItem: string | null;
  activeItemSets: string[];
  latestSetId: string | null;
  setLatestSetId: (id: string | null) => void;
  sortedSets: DailyDiscSet[];
  data: Dictionary<DailyDiscSet>;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DrawerContent({
  activeItem,
  activeItemSets,
  setLatestSetId,
  sortedSets,
  data,
  addEntryToUpdate,
}: DrawerContentProps) {
  const [selections, setSelections] = useState<string[]>(activeItemSets);

  if (!activeItem) return null;

  const onSelect = (sets: any) => {
    setSelections(sets);
  };

  const onToggleToSelection = (setId: string) => {
    setSelections((prev) => {
      if (prev.includes(setId)) {
        return prev.filter((id) => id !== setId);
      }
      return [...prev, setId];
    });
  };

  const onAdd = () => {
    selections.forEach((setId: string) => {
      addEntryToUpdate(setId, {
        ...data[setId],
        itemsIds: [...data[setId].itemsIds, activeItem],
      });
    });
    setLatestSetId(selections[selections.length - 1]);
  };

  const options = sortedSets.map((set) => ({ value: set.id, label: set.title.pt }));

  return (
    <Flex gap={16} vertical>
      <Item itemId={activeItem} />
      <Button disabled={isEqual(activeItemSets, selections)} onClick={onAdd} type="primary">
        Save to Sets
      </Button>
      <Select mode="tags" onChange={onSelect} options={options} value={selections}></Select>
      <Flex gap={8} wrap="wrap">
        {sortedSets.map((set) => (
          <Tag
            color={selections.includes(set.id) ? 'gold' : undefined}
            key={set.id}
            onClick={() => onToggleToSelection(set.id)}
          >
            {set.title.pt}
          </Tag>
        ))}
      </Flex>
    </Flex>
  );
}
