import { App, Button, Flex, InputNumber, Space, Typography } from 'antd';
import { FilterNumber, FilterSelect, FilterSwitch, TransparentButton } from 'components/Common';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { keys, sampleSize, shuffle, sortBy } from 'lodash';
import { useState } from 'react';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import clsx from 'clsx';
import { ItemAtributesValues } from 'types';
import { LineChartOutlined } from '@ant-design/icons';

export function ItemSimulation() {
  const { attributes, availableItemIds, getItemAttributeValues, getItem } = useItemsAttributeValuesContext();
  const { message } = App.useApp();

  const [gridSize, setGridSize] = useState<16 | 25>(25);
  const [reliabilityThreshold, setReliabilityThreshold] = useState<number>(90);
  const [nsfw, setNsfw] = useState<boolean>(false);
  const [selectedItemsIds, setSelectedItemsIds] = useState<string[]>([]);
  const [selectedAttributeKeys, setSelectedAttributeKeys] = useState<string[]>([]);
  const [highlightedAttributeKey, setHighlightedAttributeKey] = useState<string | null>(null);

  const onGetSample = () => {
    const keysDict: Record<string, string> = {};

    const shuffledIds = shuffle(availableItemIds);

    while (Object.values(keysDict).length < gridSize) {
      const itemId = shuffledIds.pop();
      if (!itemId) break;

      const itemAttributeValues = getItemAttributeValues(itemId);

      if (!itemAttributeValues) continue;
      if (
        !itemAttributeValues.complete ||
        !itemAttributeValues.reliability ||
        itemAttributeValues.reliability < reliabilityThreshold
      )
        continue;

      if (!nsfw && getItem(itemId).nsfw) continue;

      if (itemAttributeValues.key && !keysDict[itemAttributeValues.key]) {
        keysDict[itemAttributeValues.key] = itemId;
      } else {
        console.log('Item has identical key to another item. Skipping.', getItem(itemId).name.en);
      }
    }
    const result = Object.values(keysDict);
    if (result.length < gridSize) {
      message.error(`Could not generate sample. Got only ${result.length} items`);
    }

    setSelectedItemsIds(sortBy(result, (itemId) => Number(itemId)));

    // Get the most common attributes
    const res = getHighestAttributeKeys(
      result.map((itemId) => getItemAttributeValues(itemId)),
      25
    );

    setSelectedAttributeKeys(res);
  };

  console.log({ highlightedAttributeKey });

  return (
    <div className="my-4">
      <Typography.Title level={5}>Simulator</Typography.Title>

      <Space wrap align="center">
        <FilterSelect
          label="Grid Size"
          value={gridSize}
          onChange={(value) => setGridSize(value)}
          options={[16, 25]}
        />
        <FilterNumber
          label="Reliability Threshold"
          value={reliabilityThreshold}
          onChange={(value) => setReliabilityThreshold(value)}
          step={5}
          min={10}
          max={100}
        />
        <FilterSwitch label="NSFW" value={nsfw} onChange={setNsfw} />
        <Button onClick={onGetSample} type="primary">
          Get Sample
        </Button>
      </Space>

      <div className="simulator-grid" style={{ gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, 1fr)` }}>
        {selectedItemsIds.map((itemId) => {
          const item = getItem(itemId);
          const itemAttributeValues = getItemAttributeValues(itemId);
          return (
            <Space
              key={itemId}
              direction="vertical"
              className={clsx(
                'simulator-grid__entry',
                highlightedAttributeKey &&
                  itemAttributeValues.attributes[highlightedAttributeKey] > 0 &&
                  'simulator-grid__entry--highlighted'
              )}
              align="center"
            >
              <Space>
                <Flex vertical>
                  <ItemId item={item} />
                  <span>
                    <InputNumber
                      prefix={<LineChartOutlined />}
                      placeholder="Reliability"
                      variant="borderless"
                      size="small"
                      value={itemAttributeValues.reliability}
                      readOnly
                      style={{ width: '8ch' }}
                      formatter={(value) => `${value}%`}
                    />
                  </span>
                  <ItemGoTo item={item} />
                </Flex>

                <ItemSprite item={item} width={50} />
              </Space>
              <ItemName item={item} language="en" />
              <ItemName item={item} language="pt" />
            </Space>
          );
        })}
      </div>

      <div className="simulator-grid my-4">
        {selectedAttributeKeys.sort().map((key) => (
          <TransparentButton
            key={key}
            className={clsx(
              'simulator-grid__entry',
              'simulator-grid__button',
              highlightedAttributeKey === key && 'simulator-grid__entry--highlighted'
            )}
            onClick={() => setHighlightedAttributeKey(key)}
          >
            {attributes[key].name.en}
          </TransparentButton>
        ))}
      </div>
    </div>
  );
}

function getHighestAttributeKeys(
  selectedItemsAttributesValues: ItemAtributesValues[],
  quantity: number
): string[] {
  // 1. Count the number of times each attribute is present. Make sure to gather any deterministic value
  const attributesCounts: Record<string, number> = {};
  const deterministicKeysDict: BooleanDictionary = {};
  selectedItemsAttributesValues.forEach((itemAttributeValues) => {
    if (!itemAttributeValues) return;
    Object.keys(itemAttributeValues.attributes).forEach((key) => {
      if (itemAttributeValues.attributes[key] > 0) {
        attributesCounts[key] = (attributesCounts[key] || 0) + 1;
      }
      if (itemAttributeValues.attributes[key] === ATTRIBUTE_VALUE.DETERMINISTIC) {
        deterministicKeysDict[key] = true;
        attributesCounts[key] = (attributesCounts[key] || 0) + 2;
      }
      if (itemAttributeValues.attributes[key] === ATTRIBUTE_VALUE.OPPOSITE) {
        attributesCounts[key] = (attributesCounts[key] || 0) + 1;
      }
    });
  });
  console.log({ attributesCounts });

  const deterministicKeys = Object.keys(deterministicKeysDict);
  const nondeterministicKeys = keys(attributesCounts).filter((key) => !deterministicKeys.includes(key));

  console.log({ deterministicKeys });

  // 1.b If deterministic keys are exactly the quantity, return them
  if (quantity === deterministicKeys.length) {
    console.log('All keys are deterministic');
    return deterministicKeys;
  }

  // 2. Get all keys and sort them by value in descending order
  const sortedKeys = keys(attributesCounts).sort((a, b) => attributesCounts[b] - attributesCounts[a]);

  // 2.b. Handle edge cases: empty object or quantity exceeding keys
  if (sortedKeys.length === 0) {
    return [];
  }

  const deterministicTiedGroups = deterministicKeys.reduce((acc: Record<string, string[]>, key) => {
    const value = attributesCounts[key];
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(key);
    return acc;
  }, {});
  const sortedDeterministicTiedGroupsKeys = keys(deterministicTiedGroups).sort(
    (a, b) => Number(b) - Number(a)
  );

  const nondeterministicTiedGroups = nondeterministicKeys.reduce((acc: Record<string, string[]>, key) => {
    const value = attributesCounts[key];
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(key);
    return acc;
  }, {});
  const sortedNondeterministicTiedGroupsKeys = keys(nondeterministicTiedGroups).sort(
    (a, b) => Number(b) - Number(a)
  );

  let result: string[] = [];

  for (const group of sortedDeterministicTiedGroupsKeys) {
    if (result.length === quantity) {
      break;
    }
    result.push(...sampleSize(deterministicTiedGroups[group], quantity - result.length));
  }

  for (const group of sortedNondeterministicTiedGroupsKeys) {
    if (result.length === quantity) {
      break;
    }
    result.push(...sampleSize(nondeterministicTiedGroups[group], quantity - result.length));
  }

  console.log(result);

  return result;
}
