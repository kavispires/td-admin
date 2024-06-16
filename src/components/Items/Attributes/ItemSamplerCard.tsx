import { Button, Card, Divider, Flex, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemSampler } from 'hooks/useItemSampler';
import { isEmpty } from 'lodash';
import { Fragment } from 'react';

import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';

export function ItemSamplerCard() {
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();
  const { sampleIds, attribute, onGetSample, updateAttributeValue } = useItemSampler();

  if (isEmpty(sampleIds) && isEmpty(attribute)) {
    return (
      <Card className="my-4">
        <Typography.Text type="secondary">
          No sample has been generated. Tweak options and{' '}
          <Button size="small" type="primary" onClick={onGetSample}>
            Get Sample
          </Button>
        </Typography.Text>
      </Card>
    );
  }

  const sample = sampleIds.map((itemId) => ({
    itemAttributes: getItemAttributeValues(itemId),
    item: getItem(itemId),
  }));

  const unsetItems = sample.filter(({ itemAttributes }) => !itemAttributes.attributes[attribute!.id]);

  const onMarkRestAsUnrelated = () => {
    unsetItems.forEach(({ item }) => {
      updateAttributeValue(item.id, attribute!.id, -3);
    });
  };

  console.log(sample);

  return (
    <Card
      className="my-4"
      title={<Typography.Text>{attribute?.name.en}</Typography.Text>}
      actions={[
        <Button onClick={onMarkRestAsUnrelated} danger disabled={unsetItems.length === 0}>
          Mark rest as unrelated
        </Button>,
        <Button type="primary" ghost onClick={onGetSample}>
          Get New Sample
        </Button>,
      ]}
      extra={
        <Button type="primary" size="small" onClick={onGetSample}>
          Get New Sample
        </Button>
      }
    >
      <Flex vertical gap={6}>
        {sample.map(({ item, itemAttributes }) => {
          return (
            <Fragment key={`${item.id}-${itemAttributes.updatedAt}`}>
              <Flex gap={6}>
                <ItemSprite item={item} width={75} />
                <Flex vertical gap={6}>
                  <Flex gap={6}>
                    <ItemId item={item} />
                    <ItemGoTo item={item} />
                  </Flex>
                  <ItemName item={item} language="en" />
                  <ItemName item={item} language="pt" />
                </Flex>
                <AttributionValueButtons
                  attribute={attribute!}
                  value={itemAttributes.attributes[attribute!.id]}
                  onChange={(attributeId: string, value: number) =>
                    updateAttributeValue(item.id, attributeId, value)
                  }
                />
              </Flex>
              <Divider className="my-1" />
            </Fragment>
          );
        })}
      </Flex>
    </Card>
  );
}
