import { Badge, Divider, Drawer, Flex, InputNumber, Typography } from 'antd';
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
  const [orphanThreshold, setOrphanThreshold] = useState(1);

  const { unusedItems, usedItems } = useMemo(() => {
    const usedItems = Object.values(data).reduce((acc: Dictionary<string[]>, quartet) => {
      quartet.itemsIds.forEach((itemId) => {
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push(quartet.id);
      });
      return acc;
    }, {});

    const unusedItems = Object.keys(itemsTypeaheadQuery.data || {}).reduce(
      (acc: Record<string, number>, itemId) => {
        if (!usedItems[itemId]) {
          acc[itemId] = 0;
          return acc;
        }
        if (usedItems[itemId].length <= orphanThreshold) {
          acc[itemId] = usedItems[itemId].length;
        }
        return acc;
      },
      {},
    );

    return {
      usedItems,
      unusedItems: Object.keys(unusedItems).map((id) => ({
        id,
        count: unusedItems[id],
      })),
    };
  }, [data, itemsTypeaheadQuery.data, orphanThreshold]);

  const { page, pagination } = useGridPagination({
    data: unusedItems,
    defaultPageSize: 64,
    // resetter: ,onlyOrphans ? 'orphans' : 'all'
  });

  return (
    <>
      <div>
        <Typography.Title className="my-0" level={4}>
          Quartetos Orphans Items
        </Typography.Title>
        <Typography.Text type="secondary">
          These items are not used in any quartet. You can add them to a quartet by clicking on them.
        </Typography.Text>
      </div>
      <Flex align="center" gap={8}>
        <span>
          {unusedItems.length} Orphans | {Object.keys(usedItems).length} Used
        </span>
        <InputNumber
          min={0}
          onChange={(v) => setOrphanThreshold(v ?? 1)}
          size="small"
          style={{ width: 120 }}
          suffix="max uses"
          value={orphanThreshold}
        />
      </Flex>
      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <TransparentButton key={item.id} onClick={() => setActiveItemId(item.id)}>
              <Flex key={item.id} style={{ maxWidth: 84 }} vertical>
                <Item id={item.id} width={64} />
                <Flex align="center">
                  <Badge count={item.count} offset={[-8, 0]}>
                    <ItemId item={itemsTypeaheadQuery.data[item.id]} />
                  </Badge>
                </Flex>
              </Flex>
            </TransparentButton>
          ))}
        </Flex>
      </PaginationWrapper>
      <QuartetItemDrawer data={data} itemId={activeItemId} onClose={() => setActiveItemId(null)} {...rest} />
    </>
  );
}

type QuartetItemDrawerProps = {
  itemId: string | null;
  onClose: () => void;
} & UseResourceFirestoreDataReturnType<DailyQuartetSet>;

function QuartetItemDrawer({ itemId, onClose, ...resourceDta }: QuartetItemDrawerProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const quartetsWithItem = useMemo(() => {
    return Object.values(resourceDta.data).filter((quartet) => quartet.itemsIds.includes(itemId ?? ''));
  }, [itemId, resourceDta.data]);

  if (itemId === null) return null;

  return (
    <Drawer onClose={onClose} open={!!itemId} placement="bottom" title="Item Details">
      <Flex gap={16}>
        <Flex gap={16} vertical>
          <Item id={itemId} width={64} />
          <ItemId item={itemsTypeaheadQuery.data[itemId]} />
        </Flex>
        <Flex vertical>
          <Typography.Text strong>Used in {quartetsWithItem.length} quartets:</Typography.Text>
          {quartetsWithItem.map((quartet) => (
            <Flex key={quartet.id} vertical>
              <Typography.Text>{quartet.title}</Typography.Text>
              <Typography.Text type="secondary">({quartet.id})</Typography.Text>
              <Flex gap={8} wrap="wrap">
                {quartet.itemsIds.map((itemId) => (
                  <Item id={itemId} key={itemId} width={32} />
                ))}
              </Flex>
              <Divider />
            </Flex>
          ))}
        </Flex>
        <ItemsQuartetSearch {...resourceDta} />
      </Flex>
    </Drawer>
  );
}
