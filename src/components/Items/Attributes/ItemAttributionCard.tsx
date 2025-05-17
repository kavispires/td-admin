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

  const showOnlyUnset = is('scope');
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
          {filteredAttributesList.map((attribute) => (
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
