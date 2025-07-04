import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  LineChartOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { App, Button, Flex, InputNumber, Space, Typography } from 'antd';
import clsx from 'clsx';
import {
  FilterCheckBox,
  FilterNumber,
  FilterSelect,
  FilterSwitch,
  TransparentButton,
} from 'components/Common';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { keys, sampleSize, shuffle, sortBy } from 'lodash';
import { useState } from 'react';
import type { ItemAttribute, ItemAttributesValues } from 'types';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { DailyAlienSimulator } from './DailyAlienSimulator';

const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V'];

type AttributeSummary = {
  relatedCount: number;
  deterministicCount: number;
  unclearCount: number;
  oppositeCount: number;
} & ItemAttribute;

export function ItemSimulation() {
  const { attributes, availableItemIds, getItemAttributeValues, getItem } = useItemsAttributeValuesContext();
  const { message } = App.useApp();

  const [gridSize, setGridSize] = useState<16 | 25>(25);
  const [reliabilityThreshold, setReliabilityThreshold] = useState<number>(80);
  const [nsfw, setNsfw] = useState<boolean>(false);
  const [selectedItemsIds, setSelectedItemsIds] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeSummary[]>([]);
  const [highlightedAttributeKey, setHighlightedAttributeKey] = useState<string | null>(null);
  const [displays, setDisplays] = useState<BooleanDictionary>({
    id: true,
    nameEn: true,
    namePt: true,
    reliability: true,
  });

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

      if (itemAttributeValues.signature && !keysDict[itemAttributeValues.signature]) {
        keysDict[itemAttributeValues.signature] = itemId;
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
    const attributesResult = getHighestAttributeKeys(
      result.map((itemId) => getItemAttributeValues(itemId)),
      25,
      attributes,
    );

    // If less than 25 attributes are found, add more by priority
    if (attributesResult.length < 25) {
      const remainingAttributes = keys(attributes).filter((key) => !attributesResult.includes(key));
      const remainingAttributesByPriority = sortBy(remainingAttributes, (key) => attributes[key].priority);
      const toBeAdded = remainingAttributesByPriority.slice(0, 25 - attributesResult.length);
      console.log('Adding more attributes by priority', toBeAdded);
      attributesResult.push(...toBeAdded);
    }

    const dicts = attributesResult.reduce(
      (
        acc: {
          relatedCount: NumberDictionary;
          deterministicCount: NumberDictionary;
          unclearCount: NumberDictionary;
          oppositeCount: NumberDictionary;
        },
        key,
      ) => {
        result.forEach((itemId) => {
          const itemAttributeValues = getItemAttributeValues(itemId);
          if (!itemAttributeValues) return;
          switch (itemAttributeValues.attributes[key]) {
            case ATTRIBUTE_VALUE.RELATED:
              acc.relatedCount[key] = (acc.relatedCount[key] || 0) + 1;
              break;
            case ATTRIBUTE_VALUE.DETERMINISTIC:
              acc.deterministicCount[key] = (acc.deterministicCount[key] || 0) + 1;
              break;
            case ATTRIBUTE_VALUE.UNCLEAR:
              acc.unclearCount[key] = (acc.unclearCount[key] || 0) + 1;
              break;
            case ATTRIBUTE_VALUE.OPPOSITE:
              acc.oppositeCount[key] = (acc.oppositeCount[key] || 0) + 1;
              break;
          }
        });

        return acc;
      },
      { relatedCount: {}, deterministicCount: {}, unclearCount: {}, oppositeCount: {} },
    );

    setSelectedAttributes(
      attributesResult.sort().map((key) => ({
        ...attributes[key],
        relatedCount: dicts.relatedCount[key],
        deterministicCount: dicts.deterministicCount[key],
        unclearCount: dicts.unclearCount[key],
        oppositeCount: dicts.oppositeCount[key],
      })),
    );
  };

  const onUpdateDisplays = (key: string) => {
    setDisplays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="my-4">
      <Typography.Title level={3}>Simulator</Typography.Title>

      <Typography.Paragraph>
        Generates a board with items different enough to get Deterministic values in all selected attributes.
      </Typography.Paragraph>

      <Flex gap={12} wrap>
        <FilterSelect
          label="Grid Size"
          onChange={(value) => setGridSize(value)}
          options={[16, 25]}
          value={gridSize}
        />
        <FilterNumber
          label="Reliability Threshold"
          max={100}
          min={10}
          onChange={(value) => setReliabilityThreshold(value)}
          step={5}
          value={reliabilityThreshold}
        />
        <FilterSwitch label="NSFW" onChange={setNsfw} value={nsfw} />
        <Button onClick={onGetSample} type="primary">
          Get Sample Board
        </Button>
      </Flex>
      <Flex gap={12} wrap>
        <FilterCheckBox label="Show Id" onChange={() => onUpdateDisplays('id')} value={!!displays.id} />
        <FilterCheckBox
          label="Show Name (EN)"
          onChange={() => onUpdateDisplays('nameEn')}
          value={!!displays.nameEn}
        />
        <FilterCheckBox
          label="Show Name (PT)"
          onChange={() => onUpdateDisplays('namePt')}
          value={!!displays.namePt}
        />
        <FilterCheckBox
          label="Show Reliability"
          onChange={() => onUpdateDisplays('reliability')}
          value={!!displays.reliability}
        />
      </Flex>

      <div className="simulator-grid" style={{ gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, 1fr)` }}>
        {selectedItemsIds.map((itemId) => {
          const item = getItem(itemId);
          const itemAttributeValues = getItemAttributeValues(itemId);
          return (
            <Space
              align="center"
              className={clsx(
                'simulator-grid__entry',
                highlightedAttributeKey &&
                  itemAttributeValues.attributes[highlightedAttributeKey] > 0 &&
                  'simulator-grid__entry--highlighted',
              )}
              direction="vertical"
              key={itemId}
            >
              <Space>
                <Flex vertical>
                  {displays.id && <ItemId item={item} />}

                  {displays.reliability && (
                    <span>
                      <InputNumber
                        formatter={(value) => `${value}%`}
                        placeholder="Reliability"
                        prefix={<LineChartOutlined />}
                        readOnly
                        size="small"
                        style={{ width: '8ch' }}
                        value={itemAttributeValues.reliability}
                        variant="borderless"
                      />
                    </span>
                  )}

                  {displays.id && <ItemGoTo item={item} />}
                </Flex>

                <ItemSprite item={item} width={50} />
              </Space>

              {displays.nameEn && <ItemName item={item} language="en" />}
              {displays.namePt && <ItemName item={item} language="pt" />}
            </Space>
          );
        })}
      </div>

      <div className="simulator-grid my-4">
        {selectedAttributes.map((attributeSummary) => (
          <TransparentButton
            className={clsx(
              'simulator-grid__entry',
              'simulator-grid__button',
              highlightedAttributeKey === attributeSummary.id && 'simulator-grid__entry--highlighted',
            )}
            key={attributeSummary.id}
            onClick={() => setHighlightedAttributeKey(attributeSummary.id)}
          >
            {attributeSummary.name.en} {ROMAN_NUMERALS[attributeSummary.level]}
            <Flex className="my-1" gap={6} justify="center">
              <span>
                <CheckSquareOutlined
                  style={{ color: attributeSummary.deterministicCount ? 'dodgerblue' : undefined }}
                />{' '}
                {attributeSummary.deterministicCount ?? 0}
              </span>
              <span>
                <PlusSquareOutlined style={{ color: attributeSummary.relatedCount ? 'green' : undefined }} />{' '}
                {attributeSummary.relatedCount ?? 0}
              </span>
              <span>
                <CloseSquareOutlined style={{ color: attributeSummary.oppositeCount ? 'red' : undefined }} />{' '}
                {attributeSummary.oppositeCount ?? 0}
              </span>
              <span>
                <QuestionCircleOutlined
                  style={{ color: attributeSummary.unclearCount ? 'gold' : undefined }}
                />{' '}
                {attributeSummary.unclearCount ?? 0}
              </span>
            </Flex>
          </TransparentButton>
        ))}
      </div>

      <DailyAlienSimulator />
    </div>
  );
}

function getHighestAttributeKeys(
  selectedItemsAttributesValues: ItemAttributesValues[],
  quantity: number,
  attributes: Dictionary<ItemAttribute>,
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

  const levelCount: NumberDictionary = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  /**
   * Filters the given keys array based on the count of attribute levels and guards against having more than one level 4 attribute.
   */
  function filterCountLevelsAndGuardLevel4(keys: string[]) {
    return keys.filter((key) => {
      levelCount[attributes[key].level]++;

      if (levelCount[4] > 1) {
        console.log('Discarding level 4 attribute', key);
        return false;
      }
      return true;
    });
  }

  const deterministicKeys = filterCountLevelsAndGuardLevel4(Object.keys(deterministicKeysDict));
  const nondeterministicKeys = filterCountLevelsAndGuardLevel4(
    keys(attributesCounts).filter((key) => !deterministicKeys.includes(key)),
  );
  console.log({ levelCount });

  // 1.b If deterministic keys are exactly the quantity, return them
  if (quantity === deterministicKeys.length) {
    console.log('All keys are deterministic');
    return deterministicKeys;
  }

  // 2. Get all keys and sort them by value in descending order, but have only one level 5 attribute
  console.log(attributesCounts);
  // let hasLevel5Attribute = false;
  // const sortedKeys = keys(attributesCounts)
  //   .sort((a, b) => {
  //     if (attributesCounts[a] !== attributesCounts[b]) {
  //       return attributesCounts[b] - attributesCounts[a];
  //     }

  //     return attributes[a].priority - attributes[b].priority;
  //   })
  //   .filter((key) => {
  //     if (attributes[key].level !== 4) return true;

  //     if (!hasLevel5Attribute) {
  //       console.log('Keeping level 4 attribute', key, attributesCounts[key]);
  //       hasLevel5Attribute = true;
  //       return true;
  //     }
  //     console.log('Discarding level 4 attribute', key, attributesCounts[key]);

  //     return false;
  //   });

  // console.log(sortedKeys);

  // 2.b. Handle edge cases: empty object or quantity exceeding keys
  if (deterministicKeys.length === 0) {
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
    (a, b) => Number(b) - Number(a),
  );
  console.log({ sortedDeterministicTiedGroupsKeys });

  const nondeterministicTiedGroups = nondeterministicKeys.reduce((acc: Record<string, string[]>, key) => {
    const value = attributesCounts[key];
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(key);
    return acc;
  }, {});
  console.log(nondeterministicTiedGroups);
  const sortedNondeterministicTiedGroupsKeys = keys(nondeterministicTiedGroups).sort(
    (a, b) => Number(b) - Number(a),
  );

  const result: string[] = [];

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

  return result;
}

// From those, select 30 items with reliability > 90 (reliableItems) and different signatures
// Also select 20 items with reliability < 80 (extraItems) and different signatures
// Gather all itemAttributes from reliableItems with deterministic values (attribute value is 10) (adding up scores)
// If less than 30 attributes are found, add more attributes with relates values (5) until there are 30.
// If the selected attributes have a oppositeId or relatedId in the selected list, remove the one with the lowest score
// Return the 25 top attributes by score and the top 25 items by score (the sum of all their attribute values, except -3)
