import { Drawer, Flex, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { Item } from 'components/Sprites';
import { useGridPagination } from 'hooks/useGridPagination';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo, useState } from 'react';
import type { DailyQuartetSet, Item as ItemT } from 'types';
import { ItemId } from '../ItemBuildingBlocks';
import { ItemsQuartetSearch } from './ItemsQuartetSearch';

export function ItemsQuartetsOrphans({ data, ...rest }: UseResourceFirestoreDataReturnType<DailyQuartetSet>) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

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
        Quartetos Orphans
      </Typography.Title>
      <div>{unusedItems.length} Orphans</div>
      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <TransparentButton key={item.id} onClick={() => setActiveItemId(item.id)}>
              <Flex key={item.id} style={{ maxWidth: 84 }} vertical>
                <Item id={item.id} width={64} />
                <ItemId item={item} />
              </Flex>
            </TransparentButton>
          ))}
        </Flex>
      </PaginationWrapper>
      <Drawer
        onClose={() => setActiveItemId(null)}
        open={!!activeItemId}
        placement="bottom"
        title="Item Details"
      >
        {activeItemId && (
          <Flex gap={16}>
            <Flex gap={16} vertical>
              <Item id={activeItemId} width={64} />
              <ItemId item={itemsTypeaheadQuery.data[activeItemId]} />
            </Flex>
            <ItemsQuartetSearch data={data} {...rest} />
          </Flex>
        )}
      </Drawer>
    </>
  );
}
