import { Affix, Button, Card, Divider, Flex, Input, Space, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useMemo } from 'react';

import { IdcardOutlined } from '@ant-design/icons';

import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemAttributeDescription } from './ItemAttributeDescription';
import { ItemAttributeStats } from './ItemAttributeStats';

export function ItemAttributionCard() {
  const { activeItem, attributesList, itemAttributeValues, onAttributeChange, jumpToItem, attributes } =
    useItemsAttributeValuesContext();
  const { searchParams } = useItemQueryParams();
  const showOnlyUnset = searchParams.get('scope') === 'unset';
  const filteredAttributesList = useMemo(
    () =>
      showOnlyUnset
        ? attributesList.filter((attribute) => !itemAttributeValues.attributes[attribute.id])
        : attributesList,
    [showOnlyUnset] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
        <Affix offsetTop={120} className="item-attribution-card__item">
          <Flex vertical gap={6} key={activeItem.id}>
            <Item id={activeItem.id} width={150} title={`${activeItem.name.en} | ${activeItem.name.pt}`} />
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
            <Divider className="my-2" />
            <ItemAttributeStats attributesList={attributesList} itemAttributeValues={itemAttributeValues} />
            <Divider className="my-2" />
            <Typography.Text type="secondary">
              <ItemAttributeDescription itemAttributeValues={itemAttributeValues} attributes={attributes} />
            </Typography.Text>
          </Flex>
        </Affix>

        <Space size="small" direction="vertical" className="my-4 attribute-button-container" wrap>
          {filteredAttributesList.map((attribute, index) => (
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
