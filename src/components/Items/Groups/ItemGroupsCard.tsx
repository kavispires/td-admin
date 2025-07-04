import { Card, Select, Space, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { Item as ItemT } from 'types';
import { ItemName, ItemNsfw, ItemSprite } from '../ItemBuildingBlocks';

const COLORS_GROUPS = ['8bc4f', '96efa', 'c10eb', '16ec3', '2a97f', '4bba8', '565ed', '5fb57', '62a8b'];

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
      style={{ maxWidth: 250, ...getBorderColor(itemGroups) }}
      title={
        <>
          <Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>
          <ItemNsfw item={item} />
        </>
      }
    >
      <ItemSprite item={item} width={75} />
      <Space className="my-4" direction="vertical" size="small">
        <ItemName item={item} language="en" />
        <ItemName item={item} language="pt" />

        <Select
          defaultValue={itemGroups}
          filterOption={(input, option) => !!option?.label.toLowerCase().includes(input.toLowerCase())}
          key={String(itemGroups)}
          mode="multiple"
          onChange={(groups) => onUpdateItemGroups(item.id, groups)}
          options={groupsTypeahead}
          placeholder="Select a group"
          size="small"
          style={{ width: '100%' }}
        />
      </Space>
    </Card>
  );
}

const getBorderColor = (itemGroups?: string[]) => {
  if (!itemGroups || itemGroups?.length === 0) {
    return { borderColor: 'orange' };
  }
  if (itemGroups?.every((group) => COLORS_GROUPS.includes(group))) {
    return { borderColor: 'red' };
  }

  return {};
};
