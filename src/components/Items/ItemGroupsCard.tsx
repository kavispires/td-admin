import { Card, Flex, Input, InputRef, Popover, Select, Space, Tag, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from 'react';
import { Item as ItemT } from 'types';

import { EditOutlined, PlusOutlined } from '@ant-design/icons';

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
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select a group"
          defaultValue={itemGroups}
          options={groupsTypeahead}
          showSearch
          size="small"
          key={String(itemGroups)}
          onChange={(groups) => onUpdateItemGroups(item.id, groups)}
        />
        <Flex gap={4}>
          <EditItemGroupsPanel
            item={item}
            itemGroups={itemGroups}
            groupsTypeahead={groupsTypeahead}
            onUpdateItemGroups={onUpdateItemGroups}
          />
          <AddNewGroup
            item={item}
            itemGroups={itemGroups}
            groupsTypeahead={groupsTypeahead}
            onUpdateItemGroups={onUpdateItemGroups}
          />
        </Flex>
      </Space>
    </Card>
  );
}

function EditItemGroupsPanel({
  item,
  itemGroups = [],
  groupsTypeahead,
  onUpdateItemGroups,
}: ItemGroupsCardProps) {
  const groupsPanel = (
    <Space wrap className="item-groups-panel-container">
      {groupsTypeahead.map((group) => {
        const isActive = itemGroups.includes(group.value);

        return (
          <Tag
            key={group.value}
            bordered={!isActive}
            color={isActive ? 'processing' : undefined}
            onClick={() =>
              onUpdateItemGroups(
                item.id,
                isActive ? itemGroups.filter((g) => g !== group.value) : [...itemGroups, group.value]
              )
            }
          >
            {group.label}
          </Tag>
        );
      })}
    </Space>
  );

  return (
    <Popover
      content={groupsPanel}
      title={`Select Tags for "${item.name.en}"`}
      trigger="click"
      placement="bottom"
    >
      <Tag style={{ cursor: 'pointer' }}>
        <EditOutlined />
      </Tag>
    </Popover>
  );
}

function AddNewGroup({ item, itemGroups = [], groupsTypeahead, onUpdateItemGroups }: ItemGroupsCardProps) {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !groupsTypeahead.find((group) => group.label === inputValue)) {
      onUpdateItemGroups(item.id, [...itemGroups, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const tagPlusStyle: CSSProperties = {
    height: 22,
    // background: token.colorBgContainer,
    borderStyle: 'dashed',
    cursor: 'pointer',
  };
  const tagInputStyle: CSSProperties = {
    width: 64,
    height: 22,
    marginInlineEnd: 8,
    verticalAlign: 'top',
  };

  return (
    <>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          New Group
        </Tag>
      )}
    </>
  );
}
