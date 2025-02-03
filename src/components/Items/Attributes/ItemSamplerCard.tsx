import { Button, Card, Divider, Empty, Flex, Modal, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useItemSampler } from 'hooks/useItemSampler';
import { isEmpty } from 'lodash';
import { Fragment } from 'react';
import { useToggle } from 'react-use';
import { wait } from 'utils';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemAttributionDrawer } from './ItemAttributionDrawer';

export function ItemSamplerCard() {
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();
  const { sampleIds, attribute, onGetSample, updateAttributeValue, itemsLeftForAttribute } = useItemSampler();
  const { addQueryParam } = useItemQueryParams();

  if (isEmpty(sampleIds) && isEmpty(attribute)) {
    return (
      <Card className="my-4">
        <Typography.Text type="secondary">
          No sample has been generated. Tweak options and{' '}
          <Button size="small" type="primary" onClick={onGetSample}>
            Get Sample
          </Button>
        </Typography.Text>

        <Divider />

        <SingleSampleModalFlow />
      </Card>
    );
  }

  const sample = sampleIds.map((itemId) => ({
    itemAttributes: getItemAttributeValues(itemId),
    item: getItem(itemId),
  }));

  const unsetItems = sample.filter(
    ({ itemAttributes }) => attribute?.id && !itemAttributes.attributes[attribute.id],
  );

  const onMarkRestAsUnrelated = () => {
    unsetItems.forEach(({ item }) => {
      if (attribute?.id) {
        updateAttributeValue(item.id, attribute.id, -3);
      }
    });
  };

  return (
    <>
      <SingleSampleModalFlow />
      <Card
        className="my-4"
        title={
          <Typography.Text>
            {attribute?.name.en} - {attribute?.description.en} ({itemsLeftForAttribute} items left)
          </Typography.Text>
        }
        actions={[
          <Button key="1" onClick={onMarkRestAsUnrelated} danger disabled={unsetItems.length === 0}>
            Mark rest as unrelated
          </Button>,
          <Button key="2" type="primary" ghost onClick={onGetSample}>
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
          {sample.length === 0 && (
            <Empty
              description="No unset items found for this attribute."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
          {sample.map(({ item, itemAttributes }) => {
            return (
              <Fragment key={`${item.id}-${itemAttributes.updatedAt}`}>
                <Flex gap={6}>
                  <ItemSprite item={item} width={75} />
                  <Flex vertical gap={6}>
                    <Flex gap={6}>
                      <ItemId item={item} />
                      <Button.Group>
                        <ItemGoTo item={item} />
                        <Button size="small" shape="round" onClick={() => addQueryParam('drawer', item.id)}>
                          Drawer
                        </Button>
                      </Button.Group>
                    </Flex>
                    <ItemName item={item} language="en" />
                    <ItemName item={item} language="pt" />
                  </Flex>
                  {!!attribute && (
                    <AttributionValueButtons
                      attribute={attribute}
                      value={itemAttributes.attributes[attribute.id]}
                      onChange={(attributeId: string, value: number) =>
                        updateAttributeValue(item.id, attributeId, value)
                      }
                    />
                  )}
                </Flex>
                <Divider className="my-1" />
              </Fragment>
            );
          })}
        </Flex>
        <ItemAttributionDrawer />
      </Card>
    </>
  );
}

export function SingleSampleModalFlow() {
  const [open, toggleOpen] = useToggle(false);
  const { addQueryParam, removeQueryParam } = useItemQueryParams();
  const { sampleIds, attribute, onGetSample, updateAttributeValue } = useItemSampler();
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();

  const handleOpenSingleSampler = () => {
    addQueryParam('size', '1');
    toggleOpen(true);
    onGetSample();
  };

  const onClose = () => {
    removeQueryParam('size');
    toggleOpen(false);
  };

  const itemId = sampleIds[0];
  const item = getItem(itemId);
  const itemAttributes = getItemAttributeValues(itemId);

  return (
    <Flex className="mt-4">
      <Button type="primary" onClick={handleOpenSingleSampler}>
        Single Sampler
      </Button>
      <Modal
        title={
          <Typography>
            Single Sampler: <strong>{attribute?.name.en}</strong>
          </Typography>
        }
        open={open}
        width="100vw"
        maskClosable={false}
        onOk={onClose}
        onClose={onClose}
        onCancel={onClose}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
      >
        {itemId && item && itemAttributes && attribute && (
          <Flex gap={6} className="my-10" wrap="wrap" key={itemId}>
            <ItemSprite item={item} width={150} />
            <Flex vertical gap={6}>
              <Flex gap={6}>
                <ItemId item={item} />
                <ItemGoTo item={item} />
              </Flex>
              <ItemName item={item} language="en" />
              <ItemName item={item} language="pt" />
            </Flex>
            {!!attribute && (
              <AttributionValueButtons
                size="large"
                attribute={attribute}
                value={itemAttributes.attributes[attribute.id]}
                onChange={async (attributeId: string, value: number) => {
                  updateAttributeValue(item.id, attributeId, value);
                  await wait(500);
                  onGetSample();
                }}
              />
            )}
          </Flex>
        )}
        <Button onClick={onGetSample}>Another Sample</Button>
      </Modal>
    </Flex>
  );
}
