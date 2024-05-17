import { Card, Select, Space, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { Item as ItemT } from 'types';
import { ItemName, ItemNsfw, ItemSprite } from './ItemBuildingBlocks';

type ItemGroupsCardProps = {
  item: ItemT;
  itemGroups?: string[];
  groupsTypeahead: { label: string; value: string }[];
  onAddToGroup: (groupId: string, itemId: string) => void;
};

export function ItemGroupsCard({ item, itemGroups, groupsTypeahead, onAddToGroup }: ItemGroupsCardProps) {
  const copyToClipboard = useCopyToClipboardFunction();

  // const onInputKeyDown = (event: any) => {
  //   if (event.key === 'Enter' && event.target.value) {
  //     console.log('PRESSED ENTER', event.target.value.trim());
  //     onAddToGroup(event.target.value.trim(), item.id);
  //   }
  // };

  return (
    <Card
      title={
        <>
          <Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>
          <ItemNsfw item={item} />
        </>
      }
      style={{ maxWidth: 250 }}
    >
      <ItemSprite item={item} width={75} />
      <Space size="small" direction="vertical" className="my-4">
        <ItemName item={item} language="en" />
        <ItemName item={item} language="pt" />

        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select a category"
          defaultValue={itemGroups}
          options={groupsTypeahead}
          showSearch
          size="small"
          key={String(itemGroups)}
          // onChange={(groups) => onUpdateItemGroup(item.id, groups, )}
          onSelect={(group) => onAddToGroup(group, item.id)}
          // onInputKeyDown={onInputKeyDown}
        />
      </Space>
    </Card>
  );
}
