import { Button, Flex, Space, Table, type TableColumnsType, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { type ItemMessageObject, useItemsComparator } from 'hooks/useItemsComparator';
import { useQueryParams } from 'hooks/useQueryParams';
import type { Item } from 'types';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributeSprite } from './ItemAttributeDescription';
import { ItemAttributionDrawer } from './ItemAttributionDrawer';

export function ItemComparatorCard() {
  const { attributes } = useItemsAttributeValuesContext();
  const { itemMessages, grouping } = useItemsComparator();
  const { addParam } = useQueryParams();

  const columns: TableColumnsType<ItemMessageObject> = [
    {
      title: 'Item Id',
      dataIndex: 'item',
      key: 'id',
      render: (item: Item) => (
        <div>
          <ItemId item={item} />
          <Space.Compact>
            <ItemGoTo item={item} />
            <Button onClick={() => addParam('drawer', item.id)} shape="round" size="small">
              Drawer
            </Button>
          </Space.Compact>
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
              attributes={attributes}
              firstElement={index === 0}
              key={`${keyVariant}-${item.id}`}
              keyVariant={keyVariant}
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
      <Table columns={columns} dataSource={itemMessages} pagination={{ showQuickJumper: true }} />
      <ItemAttributionDrawer />
    </div>
  );
}
