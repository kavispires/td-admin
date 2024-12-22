import { App, Button, Flex, InputNumber, Space, Typography } from 'antd';
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
import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import clsx from 'clsx';
import { ItemAtributesValues, ItemAttribute } from 'types';
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  LineChartOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { DailyAliemSimulator } from './DailyAlienSimulator';

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
  const [reliabilityThreshold, setReliabilityThreshold] = useState<number>(90);
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

      <Flex wrap gap={12}>
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
          Get Sample Board
        </Button>
      </Flex>
      <Flex wrap gap={12}>
        <FilterCheckBox label="Show Id" value={!!displays.id} onChange={() => onUpdateDisplays('id')} />
        <FilterCheckBox
          label="Show Name (EN)"
          value={!!displays.nameEn}
          onChange={() => onUpdateDisplays('nameEn')}
        />
        <FilterCheckBox
          label="Show Name (PT)"
          value={!!displays.namePt}
          onChange={() => onUpdateDisplays('namePt')}
        />
        <FilterCheckBox
          label="Show Reliability"
          value={!!displays.reliability}
          onChange={() => onUpdateDisplays('reliability')}
        />
      </Flex>

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
                  'simulator-grid__entry--highlighted',
              )}
              align="center"
            >
              <Space>
                <Flex vertical>
                  {displays.id && <ItemId item={item} />}

                  {displays.reliability && (
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
            key={attributeSummary.id}
            className={clsx(
              'simulator-grid__entry',
              'simulator-grid__button',
              highlightedAttributeKey === attributeSummary.id && 'simulator-grid__entry--highlighted',
            )}
            onClick={() => setHighlightedAttributeKey(attributeSummary.id)}
          >
            {attributeSummary.name.en} {ROMAN_NUMERALS[attributeSummary.level]}
            <Flex gap={6} justify="center" className="my-1">
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

      <DailyAliemSimulator />
    </div>
  );
}

function getHighestAttributeKeys(
  selectedItemsAttributesValues: ItemAtributesValues[],
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

  return result;
}
