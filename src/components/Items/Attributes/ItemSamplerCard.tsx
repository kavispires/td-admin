import { Button, Card, Divider, Empty, Flex, Modal, Space, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemSampler } from 'hooks/useItemSampler';
import { useQueryParams } from 'hooks/useQueryParams';
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
  const { addParam } = useQueryParams();

  if (isEmpty(sampleIds) && isEmpty(attribute)) {
    return (
      <Card className="my-4">
        <Typography.Text type="secondary">
          No sample has been generated. Tweak options and{' '}
          <Button onClick={onGetSample} size="small" type="primary">
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
        actions={[
          <Button danger disabled={unsetItems.length === 0} key="1" onClick={onMarkRestAsUnrelated}>
            Mark rest as unrelated
          </Button>,
          <Button ghost key="2" onClick={onGetSample} type="primary">
            Get New Sample
          </Button>,
        ]}
        className="my-4"
        extra={
          <Button onClick={onGetSample} size="small" type="primary">
            Get New Sample
          </Button>
        }
        title={
          <Typography.Text>
            {attribute?.name.en} - {attribute?.description.en} ({itemsLeftForAttribute} items left)
          </Typography.Text>
        }
      >
        <Flex gap={6} vertical>
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
                  <Flex gap={6} vertical>
                    <Flex gap={6}>
                      <ItemId item={item} />
                      <Space.Compact>
                        <ItemGoTo item={item} />
                        <Button onClick={() => addParam('drawer', item.id)} shape="round" size="small">
                          Drawer
                        </Button>
                      </Space.Compact>
                    </Flex>
                    <ItemName item={item} language="en" />
                    <ItemName item={item} language="pt" />
                  </Flex>
                  {!!attribute && (
                    <AttributionValueButtons
                      attribute={attribute}
                      onChange={(attributeId: string, value: number) =>
                        updateAttributeValue(item.id, attributeId, value)
                      }
                      value={itemAttributes.attributes[attribute.id]}
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
  const { addParam, removeParam } = useQueryParams();
  const { sampleIds, attribute, onGetSample, updateAttributeValue } = useItemSampler();
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();

  const handleOpenSingleSampler = () => {
    addParam('size', '1');
    toggleOpen(true);
    onGetSample();
  };

  const onClose = () => {
    removeParam('size');
    toggleOpen(false);
  };

  const itemId = sampleIds[0];
  const item = getItem(itemId);
  const itemAttributes = getItemAttributeValues(itemId);

  return (
    <Flex className="mt-4">
      <Button onClick={handleOpenSingleSampler} type="primary">
        Single Sampler
      </Button>
      <Modal
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        maskClosable={false}
        onCancel={onClose}
        onOk={onClose}
        open={open}
        title={
          <Typography>
            Single Sampler: <strong>{attribute?.name.en}</strong>
          </Typography>
        }
        width="100vw"
      >
        {itemId && item && itemAttributes && attribute && (
          <Flex className="my-10" gap={6} key={itemId} wrap="wrap">
            <ItemSprite item={item} width={150} />
            <Flex gap={6} vertical>
              <Flex gap={6}>
                <ItemId item={item} />
                <ItemGoTo item={item} />
              </Flex>
              <ItemName item={item} language="en" />
              <ItemName item={item} language="pt" />
            </Flex>
            {!!attribute && (
              <AttributionValueButtons
                attribute={attribute}
                onChange={async (attributeId: string, value: number) => {
                  updateAttributeValue(item.id, attributeId, value);
                  await wait(500);
                  onGetSample();
                }}
                size="large"
                value={itemAttributes.attributes[attribute.id]}
              />
            )}
          </Flex>
        )}
        <Button onClick={onGetSample}>Another Sample</Button>
      </Modal>
    </Flex>
  );
}
