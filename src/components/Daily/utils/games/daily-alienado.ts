/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import type { ItemAttributeData, ItemAttributesValuesData, ItemData } from '@types';
import { makeArray } from '@utils/array';
import { ATTRIBUTE_VALUE } from '@utils/constants';
import { sample, sampleSize, shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

type DailyAlienGameAttribute = {
  /**
   * Attribute ID
   */
  id: string;
  /**
   * Attribute display name
   */
  name: string;
  /**
   * Attribute description
   */
  description: string;
  /**
   * Associated sprite ID for visual representation
   */
  spriteId: string;
  /**
   * Items that match this attribute
   */
  itemsIds: string[];
};

type DailyAlienGameRequest = {
  /**
   * Sprite IDs representing the attributes for this request
   */
  spritesIds: string[];
  /**
   * Item ID that satisfies the request
   */
  itemId: string;
};

export type DailyAlienadoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Set identifier based on attribute combination
   */
  setId: string;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'alienado';
  /**
   * Three attributes used in this puzzle
   */
  attributes: DailyAlienGameAttribute[];
  /**
   * Four requests that need to be fulfilled
   */
  requests: DailyAlienGameRequest[];
  /**
   * Solution string (concatenated item IDs)
   */
  solution: string;
  /**
   * Item IDs included in the puzzle
   */
  itemsIds: string[];
  valid?: boolean;
};

type ProposedDailyAlienadoEntry = {
  /**
   * Set identifier based on attribute combination
   */
  setId: string;
  /**
   * Three attributes for the game
   */
  attributes: DailyAlienGameAttribute[];
  /**
   * Four requests for the game
   */
  requests: DailyAlienGameRequest[];
  /**
   * Solution string
   */
  solution: string;
  /**
   * Core item IDs used in requests
   */
  itemsIds: string[];
  /**
   * Additional items available for weekend variations
   */
  additionalItems: string[];
  /**
   * Whether the game passes validation
   */
  valid?: boolean;
};

/**
 * Hook for generating daily Alienado games
 *
 * @param enabled - Whether the generation is enabled
 * @param _queryLanguage - Target language (currently unused as Alienado uses PT)
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used games
 * @returns Generated Alienado game entries with history updates
 */
export const useDailyAlienadoGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyAlienadoEntry> => {
  // Fetch prerequisite data
  const [alienadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.ALIENADO, dailyHistory);

  const tdrItemsQuery = useTDResource<ItemData>('items', { enabled });
  const tdrAttributesQuery = useTDResource<ItemAttributeData>('items-attributes', { enabled });
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAttributesValuesData>('items-attribute-values', {
    enabled,
  });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled &&
    !!alienadoHistory &&
    tdrAttributesQuery.isSuccess &&
    tdrItemsAttributesValuesQuery.isSuccess &&
    tdrItemsQuery.isSuccess;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'alienado',
      batchSize,
      tdrAttributesQuery.dataUpdatedAt,
      tdrItemsAttributesValuesQuery.dataUpdatedAt,
      tdrItemsQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (
        !alienadoHistory ||
        !tdrAttributesQuery.data ||
        !tdrItemsAttributesValuesQuery.data ||
        !tdrItemsQuery.data
      ) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyAlienadoGames(
        batchSize,
        alienadoHistory,
        tdrAttributesQuery.data,
        tdrItemsAttributesValuesQuery.data,
        tdrItemsQuery.data,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading:
      !isReadyToGenerate ||
      tdrItemsQuery.isLoading ||
      tdrAttributesQuery.isLoading ||
      tdrItemsAttributesValuesQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: alienadoHistory?.latestDate ?? '',
      latestNumber: alienadoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Alienado games
 *
 * Generates games by selecting 3 attributes and finding items that match various combinations.
 * Uses progressive fallback: fresh games → recycled games → repeated games if needed.
 * Weekday games include 4 items, weekend games include 6 items.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used games
 * @param attributes - Available item attributes
 * @param attributeValues - Items with their attribute relationships
 * @param items - Item data for validation
 * @returns Generated entries, errors, and history update
 */
export const buildDailyAlienadoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  attributes: Dictionary<ItemAttributeData>,
  attributeValues: Dictionary<ItemAttributesValuesData>,
  items: Dictionary<ItemData>,
) => {
  if (debugDailyStore.state.alienado) {
    console.count('Creating Alienado...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyAlienadoEntry> = {};
  let updateType: 'add' | 'replace' = 'add';
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    const allAttributes = Object.values(attributes);
    const allAttributesValues = Object.values(attributeValues).filter(
      (i) => i.complete && items?.[i.id]?.nsfw !== true,
    );

    if (allAttributes.length < 3 || allAttributesValues.length === 0) {
      throw new Error('Critical: Insufficient attributes or items to generate Alienado games.');
    }

    const freshGames: ProposedDailyAlienadoEntry[] = [];
    const usedGames: ProposedDailyAlienadoEntry[] = [];
    let tries = 0;
    const MAX_TRIES = 2000;

    // Generate games with a maximum attempt limit to prevent infinite loops
    while (freshGames.length < batchSize && tries < MAX_TRIES) {
      tries++;
      const entry = generateAlienadoGame(allAttributes, allAttributesValues);

      if (entry.valid) {
        if (!history.used.includes(entry.setId)) {
          // Add fresh games (not previously used)
          if (!freshGames.some((g) => g.setId === entry.setId)) {
            freshGames.push(entry);
          }
        } else {
          // Keep backup of valid historically used games
          if (!usedGames.some((g) => g.setId === entry.setId)) {
            usedGames.push(entry);
          }
        }
      }
    }

    if (debugDailyStore.state.alienado) {
      console.log(`🔆 Generating this batch took ${tries} tries`);
    }
    let finalGames = [...freshGames];

    // FALLBACK 1: Recycle historical games using LRU if insufficient fresh games
    if (finalGames.length < batchSize) {
      errors.push('Not enough fresh valid Alienado games found. Recycling historical data.');
      updateType = 'replace';

      const needed = batchSize - finalGames.length;
      finalGames = [...finalGames, ...shuffle(usedGames).slice(0, needed)];
    }

    // FALLBACK 2: Repeat games if database is too small
    if (finalGames.length < batchSize && finalGames.length > 0) {
      const needed = batchSize - finalGames.length;
      const repeats = Array.from({ length: needed }).map((_, i) => finalGames[i % finalGames.length]);
      finalGames = [...finalGames, ...repeats];
    }

    if (finalGames.length === 0) {
      throw new Error('Critical: Failed to generate any valid Alienado games after 2000 attempts.');
    }

    // Assemble final entries
    finalGames.forEach((entry, index) => {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + index + 1;

      // Weekend variation: 4 items on weekdays, 6 items on weekends
      let itemsIds = shuffle(entry.itemsIds);
      if (checkWeekend(id)) {
        itemsIds = shuffle([...itemsIds, ...sampleSize(entry.additionalItems, 2)].filter(Boolean));
      } else {
        itemsIds = shuffle(itemsIds);
      }

      // Track usage for history update
      used.push(entry.setId);

      entries[id] = {
        id,
        number: latestNumber,
        type: 'alienado',
        setId: entry.setId,
        attributes: entry.attributes,
        requests: entry.requests,
        solution: entry.solution,
        itemsIds: itemsIds,
      };
    });
  } catch (error: unknown) {
    if (debugDailyStore.state.alienado) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Alienado generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType,
    },
  };
};

/**
 * Generates a single Alienado game
 *
 * Selects 3 random attributes and categorizes items based on their relationship to these attributes.
 * Creates 4 requests that combine different attributes (complex requests use 2-3 attributes,
 * simple requests use 1 attribute). Game is validated before returning.
 *
 * @param attributes - Available attributes to choose from
 * @param attributeValues - Items with their attribute relationships
 * @returns Proposed game entry with validation status
 */
const generateAlienadoGame = (
  attributes: ItemAttributeData[],
  attributeValues: ItemAttributesValuesData[],
): ProposedDailyAlienadoEntry => {
  const shuffledAttributeValues = shuffle(attributeValues);
  const spriteIDs = shuffle(makeArray(50, 0));

  // Select 3 random attributes and assign random sprite IDs
  const selectedAttributes = sampleSize(attributes, 3).map((attr) => ({
    ...attr,
    spriteId: `${spriteIDs.pop()}`,
  }));

  // Categorize items based on attribute combinations
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

    // Check attribute values (undefined means unrelated)
    const valA = item.attributes[selectedAttributes[0]?.id] ?? ATTRIBUTE_VALUE.UNRELATED;
    const valB = item.attributes[selectedAttributes[1]?.id] ?? ATTRIBUTE_VALUE.UNRELATED;
    const valC = item.attributes[selectedAttributes[2]?.id] ?? ATTRIBUTE_VALUE.UNRELATED;

    const isVeryValueA = valA === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueA = POSITIVE.includes(valA);
    const isNotValueA = valA === ATTRIBUTE_VALUE.UNRELATED;

    const isVeryValueB = valB === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueB = POSITIVE.includes(valB);
    const isNotValueB = valB === ATTRIBUTE_VALUE.UNRELATED;

    const isVeryValueC = valC === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueC = POSITIVE.includes(valC);
    const isNotValueC = valC === ATTRIBUTE_VALUE.UNRELATED;

    // Categorize based on attribute combinations
    if (isNotValueA && isNotValueB && isNotValueC) {
      none.push(item.id);
      return;
    }
    if (isVeryValueA && isNotValueB && isNotValueC) attributeA.push(item.id);
    if (isNotValueA && isVeryValueB && isNotValueC) attributeB.push(item.id);
    if (isNotValueA && isNotValueB && isVeryValueC) attributeC.push(item.id);
    if (isValueA && isValueB && isNotValueC) attributeAB.push(item.id);
    if (isValueA && isNotValueB && isValueC) attributeAC.push(item.id);
    if (isNotValueA && isValueB && isValueC) attributeBC.push(item.id);
    if (isValueA && isValueB && isValueC) attributeABC.push(item.id);
  });

  // Build game attributes with sample items
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
    attributeB.length > 3 ? 3 : Math.max(attributeB.length - 1, 1),
  );
  gameAttributes[2].itemsIds = sampleSize(
    attributeC,
    attributeC.length > 3 ? 3 : Math.max(attributeC.length - 1, 1),
  );

  const usedItemsIds: string[] = [];
  gameAttributes.forEach((attr) => {
    usedItemsIds.push(...attr.itemsIds);
  });

  // Create complex requests (items matching 2-3 attributes)
  const complexRequests: DailyAlienadoEntry['requests'] = [];
  if (attributeAB.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[1].spriteId],
      itemId: sample(attributeAB) ?? '',
    });
  }
  if (attributeAC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeAC) ?? '',
    });
  }
  if (attributeBC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[1].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeBC) ?? '',
    });
  }
  if (attributeABC.length > 0) {
    complexRequests.push({
      spritesIds: selectedAttributes.map((attr) => attr.spriteId),
      itemId: sample(attributeABC) ?? '',
    });
  }

  // Create simple requests (items matching 1 attribute) as fallback
  const simpleRequests: DailyAlienadoEntry['requests'] = [];
  if (attributeA.length > 0) {
    const availableA = attributeA.filter((id) => !usedItemsIds.includes(id));
    if (availableA.length > 0) {
      simpleRequests.push({
        spritesIds: [selectedAttributes[0].spriteId],
        itemId: availableA[0],
      });
    }
  }
  if (attributeB.length > 0) {
    const availableB = attributeB.filter((id) => !usedItemsIds.includes(id));
    if (availableB.length > 0) {
      simpleRequests.push({
        spritesIds: [selectedAttributes[1].spriteId],
        itemId: availableB[0],
      });
    }
  }
  if (attributeC.length > 0) {
    const availableC = attributeC.filter((id) => !usedItemsIds.includes(id));
    if (availableC.length > 0) {
      simpleRequests.push({
        spritesIds: [selectedAttributes[2].spriteId],
        itemId: availableC[0],
      });
    }
  }

  // Prioritize complex requests, fill with simple requests if needed
  let requests = sampleSize(complexRequests, 4);

  if (requests.length < 3) {
    requests.push(...sampleSize(simpleRequests, 4 - requests.length));
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

  // Validate game requirements
  result.valid = [
    result.attributes.length === 3,
    result.requests.length === 4,
    result.itemsIds.length === 4,
    result.attributes.every((attr) => attr.itemsIds.length > 0),
    result.requests.every((req) => req.itemId),
  ].every(Boolean);

  return result;
};
