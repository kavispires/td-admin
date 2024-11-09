import { Button, Drawer, Flex, Select, Space, Switch, Tag, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { Item } from 'components/Sprites';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { isEqual } from 'lodash';
import { useMemo, useState } from 'react';
import { DailyDiscSet, Item as ItemT } from 'types';

type OrphanItemsProps = Pick<UseResourceFirebaseDataReturnType<DailyDiscSet>, 'data' | 'addEntryToUpdate'>;

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
            (itemsDict[itemId].length === 1 && colorSetIds.includes(itemsDict[itemId][0]))
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
    [data]
  );

  return (
    <>
      <Typography.Title level={4}>Orphan Items ({orphans.length})</Typography.Title>
      <Space className="mb-4">
        <Switch
          checkedChildren="Only Orphans"
          unCheckedChildren="All Items"
          onChange={(value) => addParam('onlyOrphans', value, false)}
        />
      </Space>

      <Drawer title="Add Item to Set" open={!!activeItem} onClose={() => setActiveItem(null)}>
        {!!activeItem && (
          <DrawerContent
            activeItem={activeItem}
            activeItemSets={itemsSets?.[activeItem] ?? []}
            latestSetId={latestSetId}
            setLatestSetId={setLatestSetId}
            sortedSets={sortedSets}
            data={data}
            addEntryToUpdate={addEntryToUpdate}
          />
        )}
      </Drawer>
      <PaginationWrapper pagination={pagination} className="full-width">
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <TransparentButton key={item.id} onClick={() => setActiveItem(item.id)}>
              <Item id={item.id} />
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
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DrawerContent({
  activeItem,
  activeItemSets,
  latestSetId,
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
    <Flex vertical gap={16}>
      <Item id={activeItem} />
      <Select onChange={onSelect} mode="tags" value={selections} options={options}></Select>
      <Button type="primary" onClick={onAdd} disabled={isEqual(activeItemSets, selections)}>
        Save to Sets
      </Button>
      <Flex wrap="wrap" gap={8}>
        {sortedSets.map((set) => (
          <Tag
            onClick={() => onToggleToSelection(set.id)}
            color={selections.includes(set.id) ? 'gold' : undefined}
          >
            {set.title.pt}
          </Tag>
        ))}
      </Flex>
    </Flex>
  );
}
