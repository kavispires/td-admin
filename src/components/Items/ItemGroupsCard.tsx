import { Card, Select, Space, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { Item as ItemT } from 'types';

import { ItemName, ItemNsfw, ItemSprite } from './ItemBuildingBlocks';

type ItemGroupsCardProps = {
  item: ItemT;
  itemGroups?: string[];
  groupsTypeahead: { label: string; value: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
};

export function ItemGroupsCard({
  item,
  itemGroups,
  groupsTypeahead,
  onUpdateItemGroups,
}: ItemGroupsCardProps) {
  const copyToClipboard = useCopyToClipboardFunction();

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
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Select a group"
          defaultValue={itemGroups}
          options={groupsTypeahead}
          showSearch
          size="small"
          key={String(itemGroups)}
          onChange={(groups) => onUpdateItemGroups(item.id, groups)}
        />
      </Space>
    </Card>
  );
}
