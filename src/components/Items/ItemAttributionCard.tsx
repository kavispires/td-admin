import { Affix, Button, Card, Divider, Flex, Space, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useEffect, useMemo } from 'react';

import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemAttributeDescription } from './ItemAttributeDescription';
import { ItemAttributeStats } from './ItemAttributeStats';
import { ItemId, ItemName, ItemSprite } from './ItemBuildingBlocks';

export function ItemAttributionCard() {
  const { activeItem, attributesList, itemAttributeValues, onAttributeChange, jumpToItem, attributes } =
    useItemsAttributeValuesContext();
  const { searchParams, removeQueryParam } = useItemQueryParams();
  const queryParamsItemId = searchParams.get('itemId');

  useEffect(() => {
    if (queryParamsItemId) {
      removeQueryParam('itemId');
      jumpToItem('goTo', queryParamsItemId);
    }
  }, [queryParamsItemId, jumpToItem, removeQueryParam]);

  const showOnlyUnset = searchParams.get('scope') === 'unset';
  const filteredAttributesList = useMemo(
    () =>
      showOnlyUnset
        ? attributesList.filter((attribute) => !itemAttributeValues.attributes[attribute.id])
        : attributesList,
    [showOnlyUnset, activeItem.id] // eslint-disable-line react-hooks/exhaustive-deps
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
      <div className="item-attribution-card" key={`${activeItem.id}`}>
        <Affix offsetTop={120} className="item-attribution-card__item">
          <Flex vertical gap={6}>
            <ItemSprite item={activeItem} width={150} />
            <ItemId item={activeItem} />
            <ItemName item={activeItem} language="en" />
            <ItemName item={activeItem} language="pt" />

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
