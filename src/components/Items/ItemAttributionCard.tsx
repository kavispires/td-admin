import { Affix, Button, Card, Divider, Flex, Input, Space, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

import { IdcardOutlined } from '@ant-design/icons';

import { ItemAttributeStats } from './ItemAttributeStats';
import { AttributionValueButtons } from './AttributionValueButtons';

export function ItemAttributionCard() {
  const { activeItem, attributesList, itemAttributeValues, onAttributeChange, jumpToItem } =
    useItemsAttributeValuesContext();

  if (!activeItem)
    return (
      <Card>
        <Typography.Text type="secondary">
          No item selected.{' '}
          <Button size="small" type="primary" onClick={() => jumpToItem('random')}>
            Random Item
          </Button>
        </Typography.Text>
      </Card>
    );

  return (
    <Card>
      <div className="item-attribution-card">
        <Affix offsetTop={120}>
          <Flex vertical gap={6} key={activeItem.id}>
            <Item
              id={activeItem.id}
              width={150}
              title={`${activeItem.name.en} | ${activeItem.name.pt}`}
              // className="sticky-top"
            />
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Id"
              variant="borderless"
              size="small"
              value={activeItem.id}
              readOnly
            />

            <Input
              prefix={<LanguageFlag language="en" width="1em" />}
              placeholder="Name in EN"
              variant="borderless"
              size="small"
              value={activeItem.name.en}
              readOnly
            />

            <Input
              prefix={<LanguageFlag language="pt" width="1em" />}
              placeholder="Name in PT"
              variant="borderless"
              size="small"
              value={activeItem.name.pt}
              readOnly
            />
            <Divider />
            <ItemAttributeStats attributesList={attributesList} itemAttributeValues={itemAttributeValues} />
          </Flex>
        </Affix>

        <Space size="small" direction="vertical" className="my-4 attribute-button-container" wrap>
          {attributesList.map((attribute) => (
            <AttributionValueButtons
              key={attribute.id}
              attribute={attribute}
              value={itemAttributeValues.attributes[attribute.id]}
              onChange={onAttributeChange}
            />
          ))}
        </Space>
      </div>
    </Card>
  );
}
