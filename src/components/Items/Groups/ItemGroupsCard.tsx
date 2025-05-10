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

  const colorGroupsOnly = itemGroups?.every((group) => COLORS_GROUPS.includes(group));

  return (
    <Card
      title={
        <>
          <Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>
          <ItemNsfw item={item} />
        </>
      }
      style={{ maxWidth: 250, ...(colorGroupsOnly ? { borderColor: 'red' } : {}) }}
    >
      <ItemSprite item={item} width={75} />
      <Space size="small" direction="vertical" className="my-4">
        <ItemName item={item} language="en" />
        <ItemName item={item} language="pt" />

        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select a group"
          defaultValue={itemGroups}
          options={groupsTypeahead}
          filterOption={(input, option) => !!option?.label.toLowerCase().includes(input.toLowerCase())}
          size="small"
          key={String(itemGroups)}
          onChange={(groups) => onUpdateItemGroups(item.id, groups)}
        />
      </Space>
    </Card>
  );
}
