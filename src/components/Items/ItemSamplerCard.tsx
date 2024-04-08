import { Button, Card, Divider, Flex, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemSampler } from 'hooks/useItemSampler';
import { isEmpty } from 'lodash';
import { Fragment } from 'react';

import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemId, ItemName, ItemSprite } from './ItemBuildingBlocks';

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

  return (
    <Card
      className="my-4"
      title={<Typography.Text>{attribute?.name.en}</Typography.Text>}
      actions={[
        <Button type="primary" block ghost onClick={onGetSample}>
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
        {sampleIds.map((itemId) => {
          const itemAttributes = getItemAttributeValues(itemId);
          const item = getItem(itemId);

          return (
            <Fragment key={item.id}>
              <Flex gap={6}>
                <ItemSprite item={item} width={75} />
                <Flex vertical gap={6}>
                  <ItemId item={item} />
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
