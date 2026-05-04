import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { keys, sample, sampleSize, shuffle, values } from 'lodash';
import { useMemo } from 'react';
import type { Item, ItemAttribute, ItemAttributesValues } from 'types';
import { makeArray } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { addWarning } from '../warnings';

type DailyAlienGameAttribute = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  itemsIds: string[];
};

type DailyAlienGameRequest = {
  spritesIds: string[];
  itemId: string;
};

export type DailyAlienadoEntry = {
  id: DateKey;
  setId: string;
  number: number;
  type: 'alienado';
  attributes: DailyAlienGameAttribute[];
  requests: DailyAlienGameRequest[];
  solution: string;
  itemsIds: string[];
  valid?: boolean;
};

type ProposedDailyAlienadoEntry = {
  setId: string;
  attributes: DailyAlienGameAttribute[];
  requests: DailyAlienGameRequest[];
  solution: string;
  itemsIds: string[];
  additionalItems: string[];
  valid?: boolean;
};

export const useDailyAlienadoGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [alienadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.ALIENADO, dailyHistory);

  const tdrItemsQuery = useTDResource<Item>('items', { enabled });
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes', { enabled });
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAttributesValues>('items-attribute-values', {
    enabled,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (
      !enabled ||
      !alienadoHistory ||
      !tdrAttributesQuery.isSuccess ||
      !tdrItemsAttributesValuesQuery.isSuccess ||
      !tdrItemsQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyAlienadoGames(
      batchSize,
      alienadoHistory,
      tdrAttributesQuery.data,
      tdrItemsAttributesValuesQuery.data,
      tdrItemsQuery.data,
    );
  }, [
    enabled,
    batchSize,
    alienadoHistory,
    alienadoHistory,
    tdrAttributesQuery.dataUpdatedAt,
    tdrItemsAttributesValuesQuery.dataUpdatedAt,
    tdrItemsQuery.dataUpdatedAt,
  ]);

  return {
    entries,
    isLoading:
      tdrItemsQuery.isLoading || tdrAttributesQuery.isLoading || tdrItemsAttributesValuesQuery.isLoading,
  };
};

export const buildDailyAlienadoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  attributes: Dictionary<ItemAttribute>,
  attributeValues: Dictionary<ItemAttributesValues>,
  items: Dictionary<Item>,
) => {
  console.count('Creating Alienado...');
  let lastDate = history.latestDate;

  const allAttributes = values(attributes);
  // .filter((attr) => !attr.limited);
  const allAttributesValues = values(attributeValues).filter(
    (i) => i.complete && items?.[i.id]?.nsfw !== true,
  );

  const preliminaryEntries: Dictionary<ProposedDailyAlienadoEntry> = {};
  let tries = 0;
  while (keys(preliminaryEntries).length < batchSize + 5 && tries < ATTEMPTS_THRESHOLD) {
    const entry = generateAlienadoGame(allAttributes, allAttributesValues);
    if (entry.valid && !preliminaryEntries[entry.setId] && !history.used.includes(entry.setId)) {
      preliminaryEntries[entry.setId] = entry;
    }
    if (keys(preliminaryEntries).length >= batchSize) {
      break;
    }
    tries += 1;
  }

  console.log(`🔆 Generating this batch took ${tries} tries`);

  if (tries >= 100) {
    addWarning('alienado', 'Not enough valid alienado games (over 100 attempts)');
  }

  const entries: Dictionary<DailyAlienadoEntry> = {};
  Object.values(preliminaryEntries).forEach((entry, index) => {
    const id = getNextDay(lastDate);
    lastDate = id;

    // Variation: Weekdays (4 items), Weekend (4+2 items)
    let itemsIds = shuffle(entry.itemsIds);
    if (checkWeekend(id)) {
      itemsIds = shuffle([...itemsIds, ...sampleSize(entry.additionalItems, 2)].filter(Boolean));
    } else {
      itemsIds = shuffle(itemsIds);
    }

    entries[id] = {
      id,
      number: history.latestNumber + index + 1,
      type: 'alienado',
      setId: entry.setId,
      attributes: entry.attributes,
      requests: entry.requests,
      solution: entry.solution,
      itemsIds: itemsIds,
    };
  });

  return entries;
};

const generateAlienadoGame = (
  attributes: ItemAttribute[],
  attributeValues: ItemAttributesValues[],
): ProposedDailyAlienadoEntry => {
  const shuffledAttributeValues = shuffle(attributeValues);

  const spriteIDs = shuffle(makeArray(50, 0));

  // Select 3 attributes and reassign random sprites
  const selectedAttributes = sampleSize(attributes, 3).map((attr) => ({
    ...attr,
    spriteId: `${spriteIDs.pop()}`,
  }));
  const attributeA: string[] = [];
  const attributeB: string[] = [];
  const attributeC: string[] = [];
  const attributeAB: string[] = [];
  const attributeAC: string[] = [];
  const attributeBC: string[] = [];
  const attributeABC: string[] = [];
  const none: string[] = [];

  shuffledAttributeValues.forEach((item) => {
    const POSITIVE = [ATTRIBUTE_VALUE.DETERMINISTIC, ATTRIBUTE_VALUE.RELATED];
    const isVeryValueA = item.attributes[selectedAttributes[0].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueA = POSITIVE.includes(item.attributes[selectedAttributes[0].id]);
    const isNotValueA = item.attributes[selectedAttributes[0].id] === ATTRIBUTE_VALUE.UNRELATED;
    const isVeryValueB = item.attributes[selectedAttributes[1].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueB = POSITIVE.includes(item.attributes[selectedAttributes[1].id]);
    const isNotValueB = item.attributes[selectedAttributes[1].id] === ATTRIBUTE_VALUE.UNRELATED;
    const isVeryValueC = item.attributes[selectedAttributes[2].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueC = POSITIVE.includes(item.attributes[selectedAttributes[2].id]);
    const isNotValueC = item.attributes[selectedAttributes[2].id] === ATTRIBUTE_VALUE.UNRELATED;

    if (isNotValueA && isNotValueB && isNotValueC) {
      none.push(item.id);
      return;
    }
    if (isVeryValueA && isNotValueB && isNotValueC) {
      attributeA.push(item.id);
    }
    if (isNotValueA && isVeryValueB && isNotValueC) {
      attributeB.push(item.id);
    }
    if (isNotValueA && isNotValueB && isVeryValueC) {
      attributeC.push(item.id);
    }
    if (isValueA && isValueB && isNotValueC) {
      attributeAB.push(item.id);
    }
    if (isValueA && isNotValueB && isValueC) {
      attributeAC.push(item.id);
    }
    if (isNotValueA && isValueB && isValueC) {
      attributeBC.push(item.id);
    }
    if (isValueA && isValueB && isValueC) {
      attributeABC.push(item.id);
    }
  });

  const gameAttributes: DailyAlienadoEntry['attributes'] = selectedAttributes.map((attr) => ({
    id: attr.id,
    name: attr.name.pt,
    description: attr.description.pt,
    spriteId: attr.spriteId,
    itemsIds: [],
  }));
  gameAttributes[0].itemsIds = sampleSize(
    attributeA,
    attributeA.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );
  gameAttributes[1].itemsIds = sampleSize(
    attributeB,
    attributeB.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );
  gameAttributes[2].itemsIds = sampleSize(
    attributeC,
    attributeC.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );

  const usedItemsIds: string[] = [];
  gameAttributes.forEach((attr) => {
    usedItemsIds.push(...attr.itemsIds);
  });

  const complexRequests: DailyAlienadoEntry['requests'] = [];
  // AB request
  if (attributeAB.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[1].spriteId],
      itemId: sample(attributeAB) ?? '',
    });
  }
  // AC request
  if (attributeAC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeAC) ?? '',
    });
  }
  // BC request
  if (attributeBC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[1].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeBC) ?? '',
    });
  }
  // ABC request
  if (attributeABC.length > 0) {
    complexRequests.push({
      spritesIds: selectedAttributes.map((attr) => attr.spriteId),
      itemId: sample(attributeABC) ?? '',
    });
  }
  const simpleRequests: DailyAlienadoEntry['requests'] = [];
  // Additional request A
  if (attributeA.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[0].spriteId],
      itemId: attributeA.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }
  // Additional request B
  if (attributeB.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[1].spriteId],

      itemId: attributeB.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }
  // Additional request C
  if (attributeC.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[2].spriteId],
      itemId: attributeC.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }

  let requests = sampleSize(complexRequests, 4);

  if (requests.length < 3) {
    requests.push(...sampleSize(simpleRequests, 4 - requests.length));
  }

  if (requests.length < 4) {
    console.log('🔆 Not enough requests for an alien communication, marking it as invalid');
  }

  requests = shuffle(requests);

  const requestItemsIds: string[] = requests.map((req) => req.itemId);

  const result: ProposedDailyAlienadoEntry = {
    setId: gameAttributes
      .map((attr) => attr.id)
      .sort()
      .join('-'),
    attributes: gameAttributes,
    requests,
    solution: requestItemsIds.join('-'),
    itemsIds: requestItemsIds,
    additionalItems: none.filter(Boolean),
    valid: false,
  };

  // Validate game
  result.valid = [
    result.attributes.length === 3,
    result.requests.length === 4,
    result.itemsIds.length === 4,
    result.attributes.every((attr) => attr.itemsIds.length > 0),
    result.requests.every((req) => req.itemId),
  ].every(Boolean);

  return result;
};
