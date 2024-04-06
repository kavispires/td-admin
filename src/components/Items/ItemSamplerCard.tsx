import { Button, Card, Divider, Flex, Input, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

import { IdcardOutlined } from '@ant-design/icons';

import { isEmpty } from 'lodash';
import { useItemSampler } from 'hooks/useItemSampler';
import { Fragment } from 'react';
import { AttributionValueButtons } from './AttributionValueButtons';

export function ItemSamplerCard() {
  const { items } = useItemsAttributeValuesContext();
  const { sampleIds, itemsAttributeValues, attribute, onGetSample, updateAttributeValue } = useItemSampler();

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
          const itemAttributes = itemsAttributeValues[itemId] ?? { id: itemId, attributes: {} };
          const item = items[itemId];

          return (
            <Fragment key={item.id}>
              <Flex gap={6}>
                <Item id={item.id} width={75} title={`${item.name.en} | ${item.name.pt}`} />
                <Flex vertical gap={6}>
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Id"
                    variant="borderless"
                    size="small"
                    value={item.id}
                    readOnly
                  />
                  <Input
                    prefix={<LanguageFlag language="en" width="1em" />}
                    placeholder="Name in EN"
                    variant="borderless"
                    size="small"
                    value={item.name.en}
                    readOnly
                  />
                  <Input
                    prefix={<LanguageFlag language="pt" width="1em" />}
                    placeholder="Name in PT"
                    variant="borderless"
                    size="small"
                    value={item.name.pt}
                    readOnly
                  />
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
