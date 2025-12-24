import { Affix, Button, Card, Divider, Flex, Space, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { useEffect, useMemo } from 'react';
import { ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemAttributeDescription } from './ItemAttributeDescription';
import { ItemAttributeStats } from './ItemAttributeStats';

export function ItemAttributionCard() {
  const { activeItem, attributesList, itemAttributeValues, onAttributeChange, jumpToItem, attributes } =
    useItemsAttributeValuesContext();
  const { queryParams, removeParam, is } = useQueryParams();
  const queryParamsItemId = queryParams.get('itemId');
  const filteredAttributesIds = queryParams.get('filters');

  // biome-ignore lint/correctness/useExhaustiveDependencies: no functions
  useEffect(() => {
    if (queryParamsItemId) {
      removeParam('itemId');
      jumpToItem('goTo', queryParamsItemId);
    }
  }, [queryParamsItemId]);

  const showOnlyUnset = is('scope', 'unset');
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const filteredAttributesList = useMemo(() => {
    const shortlist = showOnlyUnset
      ? attributesList.filter((attribute) => !itemAttributeValues.attributes[attribute.id])
      : attributesList;

    if (filteredAttributesIds) {
      const parsedList = filteredAttributesIds.split(',').reduce((acc: BooleanDictionary, id) => {
        acc[id] = true;
        return acc;
      }, {});

      return shortlist.filter((attribute) => parsedList[attribute.id]);
    }

    return shortlist;
  }, [showOnlyUnset, activeItem.id, filteredAttributesIds]);

  if (!activeItem)
    return (
      <Card>
        <Typography.Text type="secondary">
          No item selected.{' '}
          <Button onClick={() => jumpToItem('random')} size="small" type="primary">
            Random Item
          </Button>
        </Typography.Text>
      </Card>
    );

  return (
    <Card>
      <div className="item-attribution-card" key={`${activeItem.id}`}>
        <Affix className="item-attribution-card__item" offsetTop={120}>
          <Flex gap={6} vertical>
            <ItemSprite item={activeItem} width={150} />
            <ItemId item={activeItem} />
            <ItemName item={activeItem} language="en" />
            <ItemName item={activeItem} language="pt" />

            <Divider className="my-2" />
            <ItemAttributeStats attributesList={attributesList} itemAttributeValues={itemAttributeValues} />
            <Divider className="my-2" />
            <Typography.Text type="secondary">
              <ItemAttributeDescription attributes={attributes} itemAttributeValues={itemAttributeValues} />
            </Typography.Text>
          </Flex>
        </Affix>

        <Space className="my-4 attribute-button-container" orientation="vertical" size="small" wrap>
          {filteredAttributesList.map((attribute) => (
            <AttributionValueButtons
              attribute={attribute}
              key={attribute.id}
              onChange={onAttributeChange}
              value={itemAttributeValues.attributes[attribute.id]}
            />
          ))}
        </Space>
      </div>
    </Card>
  );
}
