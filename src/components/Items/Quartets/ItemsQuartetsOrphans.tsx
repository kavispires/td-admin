import { Flex, Typography } from 'antd';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { Item } from 'components/Sprites';
import { useGridPagination } from 'hooks/useGridPagination';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import type { DailyQuartetSet, Item as ItemT } from 'types';
import { ItemId } from '../ItemBuildingBlocks';

export function ItemsQuartetsOrphans({ data }: UseResourceFirestoreDataReturnType<DailyQuartetSet>) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const { unusedItems } = useMemo(() => {
    const usedItems = Object.values(data).reduce((acc: Dictionary<string[]>, quartet) => {
      quartet.itemsIds.forEach((itemId) => {
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push(quartet.id);
      });
      return acc;
    }, {});

    const unusedItems = Object.keys(itemsTypeaheadQuery.data || {}).reduce((acc: ItemT[], itemId) => {
      if (!usedItems[itemId]) {
        acc.push(itemsTypeaheadQuery.data[itemId]);
      }
      return acc;
    }, []);

    return {
      usedItems,
      unusedItems,
    };
  }, [data, itemsTypeaheadQuery.data]);

  const { page, pagination } = useGridPagination({
    data: unusedItems,
    defaultPageSize: 64,
    // resetter: ,onlyOrphans ? 'orphans' : 'all'
  });

  return (
    <>
      <Typography.Title className="my-0" level={4}>
        Quartetos Simulator
      </Typography.Title>
      <div>{unusedItems.length} Orphans</div>
      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <Flex key={item.id} style={{ maxWidth: 72 }} vertical>
              <Item id={item.id} width={64} />
              <ItemId item={item} />
              {/* <ItemName item={item} language="pt" /> */}
            </Flex>
          ))}
        </Flex>
      </PaginationWrapper>
    </>
  );
}
