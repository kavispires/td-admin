import { Button, Flex, Table, type TableColumnsType, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { type ItemMessageObject, useItemsComparator } from 'hooks/useItemsComparator';
import type { Item } from 'types';

import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributeSprite } from './ItemAttributeDescription';
import { ItemAttributionDrawer } from './ItemAttributionDrawer';

export function ItemComparatorCard() {
  const { attributes } = useItemsAttributeValuesContext();
  const { itemMessages, grouping } = useItemsComparator();
  const { addQueryParam } = useItemQueryParams();

  const columns: TableColumnsType<ItemMessageObject> = [
    {
      title: 'Item Id',
      dataIndex: 'item',
      key: 'id',
      render: (item: Item) => (
        <div>
          <ItemId item={item} />
          <Button.Group>
            <ItemGoTo item={item} />
            <Button size="small" shape="round" onClick={() => addQueryParam('drawer', item.id)}>
              Drawer
            </Button>
          </Button.Group>
        </div>
      ),
      sorter: (a, b) => Number(a.item.id) - Number(b.item.id),
    },
    {
      title: 'Sprite',
      dataIndex: 'item',
      key: 'sprite',
      render: (item: Item) => <ItemSprite item={item} width={75} />,
    },
    {
      title: 'Name',
      dataIndex: 'item',
      key: 'name',
      render: (item: Item) => (
        <>
          <ItemName item={item} language="en" />
          <ItemName item={item} language="pt" />
        </>
      ),
      sorter: (a, b) => a.item.name.en.localeCompare(b.item.name.en),
    },
    {
      title: 'Address',
      dataIndex: 'message',
      key: 'message',
      render: (message: string[], { item }) => (
        <Flex gap={6}>
          {message.map((keyVariant, index, arr) => (
            <AttributeSprite
              key={`${keyVariant}-${item.id}`}
              keyVariant={keyVariant}
              attributes={attributes}
              firstElement={index === 0}
              lastElement={index === arr.length - 1}
              withText
            />
          ))}
        </Flex>
      ),
      sorter: (a, b) => a.message.join(' ').localeCompare(b.message.join(' ')),
    },
    {
      title: 'Complete',
      dataIndex: 'itemAttributesValues',
      key: 'complete',
      render: (itemAttributesValues: { complete: boolean }) => (itemAttributesValues.complete ? 'Yes' : 'No'),
    },
    {
      title: 'Identical',
      dataIndex: 'message',
      key: 'identical',
      render: (message: string[]) => {
        const group = grouping[message.join(' ')] ?? [];
        return <>{group.length > 1 ? group.length : '0'}</>;
      },
      sorter: (a, b) => {
        const groupA = grouping[a.message.join(' ')] ?? [];
        const groupB = grouping[b.message.join(' ')] ?? [];
        return groupB.length - groupA.length;
      },
    },
  ];

  return (
    <div className="my-4">
      <Typography.Title level={5}>Item Comparator</Typography.Title>
      <Table dataSource={itemMessages} columns={columns} pagination={{ showQuickJumper: true }} />
      <ItemAttributionDrawer />
    </div>
  );
}
