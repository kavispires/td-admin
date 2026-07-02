/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { getIsThingOutdated, getLatestRuleUpdate } from '@components/Items/Diagram/utils';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type UID = string;
export type DateMilliseconds = number;

export type DailyDiagramRuleData = {
  /**
   * Rule identifier
   */
  id: UID;
  /**
   * Rule title/description
   */
  title: string;
  /**
   * Difficulty level
   */
  level: number;
  /**
   * Rule type
   */
  type: string;
  /**
   * How the rule was created
   */
  method: 'auto' | 'manual' | 'dependency';
  /**
   * Last update timestamp
   */
  updatedAt: DateMilliseconds;
};

export type DailyDiagramItemData = {
  /**
   * Item identifier
   */
  itemId: UID;
  /**
   * Item name
   */
  name: string;
  /**
   * Syllable breakdown
   */
  syllables?: string;
  /**
   * Which syllable is stressed
   */
  stressedSyllable?: number;
  /**
   * Rule IDs this item matches
   */
  rules: string[];
  /**
   * Last update timestamp
   */
  updatedAt: DateMilliseconds;
};

export type DailyConjuntosEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'conjuntos';
  /**
   * Puzzle title
   */
  title: string;
  /**
   * Difficulty level (max of both rules)
   */
  level: number;
  /**
   * Set identifier
   */
  setId: string;
  /**
   * First rule with example item
   */
  rule1: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  /**
   * Second rule with example item
   */
  rule2: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  /**
   * Item that matches both rules
   */
  intersectingThing: {
    id: string;
    name: string;
  };
  /**
   * Items to categorize (2 per rule + 2 unrelated)
   */
  things: {
    id: string;
    name: string;
    rule: number;
  }[];
};

/**
 * Hook for generating daily Conjuntos games
 *
 * @param enabled - Whether the generation is enabled
 * @param _queryLanguage - Target language (currently unused)
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used rules
 * @returns Generated Conjuntos game entries with history updates
 */
export const useDailyConjuntosGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyConjuntosEntry> => {
  // Fetch prerequisite data
  const [conjuntosHistory] = useParsedHistory(DAILY_GAMES_KEYS.CONJUNTOS, dailyHistory);
  const tdrThingsQuery = useTDResource<DailyDiagramItemData>('daily-diagram-items', { enabled });
  const tdrRulesQuery = useTDResource<DailyDiagramRuleData>('daily-diagram-rules', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled && tdrThingsQuery.isSuccess && tdrRulesQuery.isSuccess && !!conjuntosHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'conjuntos',
      batchSize,
      tdrThingsQuery.dataUpdatedAt,
      tdrRulesQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!conjuntosHistory || !tdrRulesQuery.data || !tdrThingsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyConjuntosGames(batchSize, conjuntosHistory, tdrRulesQuery.data, tdrThingsQuery.data);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || generatorQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: conjuntosHistory?.latestDate ?? '',
      latestNumber: conjuntosHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Picks unique items from a pool without duplicating any names
 *
 * Safely rolls back the usedNames Set if it fails to find enough items.
 *
 * @param poolIds - Array of item IDs to choose from
 * @param count - Number of items to pick
 * @param usedNames - Set of already used item names
 * @param validItemsMap - Map of item IDs to item data
 * @returns Array of selected item IDs, or null if not enough unique items found
 */
function pickUniqueNames(
  poolIds: string[],
  count: number,
  usedNames: Set<string>,
  validItemsMap: Map<string, DailyDiagramItemData>,
): string[] | null {
  const picked: string[] = [];
  const shuffledPool = shuffle(poolIds);

  for (const id of shuffledPool) {
    const item = validItemsMap.get(id);
    const name = item?.name;

    // Skip if no valid name or name already used
    if (!name || usedNames.has(name)) continue;

    picked.push(id);
    usedNames.add(name);

    if (picked.length === count) return picked;
  }

  // Rollback on failure to avoid polluting the Set for next retry
  for (const id of picked) {
    const name = validItemsMap.get(id)?.name;
    if (name) usedNames.delete(name);
  }

  return null;
}

const RULE_TYPE_TITLES: Record<string, string> = {
  contains: 'Inclusão',
  starts: 'Inicialização',
  ends: 'Terminação',
  grammar: 'Gramática',
  order: 'Sequência',
  count: 'Contagem',
  comparison: 'Comparação',
  repetition: 'Repetição',
};

/**
 * Builds a batch of daily Conjuntos games
 *
 * Generates games by finding two rules that have intersecting items and ensuring all
 * 9 items have unique names. Uses a queue system to prioritize fresh rules with LRU fallback.
 * Each game requires:
 * - 1 item matching both rules (intersection)
 * - 3 items matching only rule 1
 * - 3 items matching only rule 2
 * - 2 items matching neither rule
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used rules
 * @param rules - Available diagram rules
 * @param items - Available diagram items
 * @returns Generated entries, errors, and history update
 */
export const buildDailyConjuntosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  rules: Dictionary<DailyDiagramRuleData>,
  items: Dictionary<DailyDiagramItemData>,
) => {
  if (debugDailyStore.state.conjuntos) {
    console.count('Creating Conjuntos...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyConjuntosEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Calculate latest rule update timestamp
    const latestRuleUpdate = getLatestRuleUpdate(rules);

    // Filter out outdated items
    const validItemsMap = new Map<string, DailyDiagramItemData>();
    for (const item of Object.values(items)) {
      if (!getIsThingOutdated(item, latestRuleUpdate)) {
        validItemsMap.set(item.itemId, item);
      }
    }
    const allValidItemIds = Array.from(validItemsMap.keys());

    // Build inverted mapping: Rule ID -> Item IDs
    const ruleItemIdsMap = new Map<string, Set<string>>();
    for (const item of validItemsMap.values()) {
      for (const ruleId of item.rules) {
        let ruleSet = ruleItemIdsMap.get(ruleId);
        if (!ruleSet) {
          ruleSet = new Set<string>();
          ruleItemIdsMap.set(ruleId, ruleSet);
        }
        ruleSet.add(item.itemId);
      }
    }

    // Filter rules with at least 15 valid items
    type ProcessedRule = DailyDiagramRuleData & { validItemIds: string[] };
    const validRules: ProcessedRule[] = [];

    for (const rule of Object.values(rules)) {
      const validIdsSet = ruleItemIdsMap.get(rule.id);
      if (validIdsSet && validIdsSet.size >= 15) {
        validRules.push({
          ...rule,
          validItemIds: Array.from(validIdsSet),
        });
      }
    }

    if (validRules.length === 0) {
      throw new Error('Critical: No valid Conjuntos rules (>= 15 items) found.');
    }

    // Setup rule queue with fresh rules first, then LRU fallback
    const freshRules = validRules.filter((r) => !history.used.includes(r.id));
    const usedRulesLRU = validRules
      .filter((r) => history.used.includes(r.id))
      .sort((a, b) => history.used.indexOf(a.id) - history.used.indexOf(b.id));

    let availableRules = [...shuffle(freshRules), ...usedRulesLRU];

    if (freshRules.length < batchSize * 2) {
      if (debugDailyStore.state.conjuntos) {
        console.log('🔆 Not enough fresh conjuntos rules left, recycling...');
      }
      errors.push('Not enough fresh Conjuntos rules. Recycling historical data.');
    }

    // Generate the batch
    for (let i = 0; i < batchSize; i++) {
      let attempts = 0;
      let found = false;
      let selectedRule1: ProcessedRule | null = null;
      let selectedRule2: ProcessedRule | null = null;
      let finalIntersect = '';
      let finalR1: string[] = [];
      let finalR2: string[] = [];
      let finalOut: string[] = [];

      const attemptedPairs = new Set<string>();

      // Search for valid rule pair satisfying all constraints
      while (attempts < 100 && !found) {
        attempts++;

        // Select from front of queue to prioritize fresh rules
        const poolSize = Math.min(availableRules.length, 30);
        const r1 = availableRules[Math.floor(Math.random() * poolSize)];
        const r2 = availableRules[Math.floor(Math.random() * poolSize)];

        if (!r1 || !r2 || r1.id === r2.id) continue;

        // Skip already tested pairs
        const pairKey = [r1.id, r2.id].sort().join('-');
        if (attemptedPairs.has(pairKey)) continue;
        attemptedPairs.add(pairKey);

        const r1Set = new Set(r1.validItemIds);
        const r2Set = new Set(r2.validItemIds);

        // Calculate item pools
        const intersectionIds = r1.validItemIds.filter((id) => r2Set.has(id));
        if (intersectionIds.length < 1) continue;

        const r1ExclusiveIds = r1.validItemIds.filter((id) => !r2Set.has(id));
        if (r1ExclusiveIds.length < 3) continue;

        const r2ExclusiveIds = r2.validItemIds.filter((id) => !r1Set.has(id));
        if (r2ExclusiveIds.length < 3) continue;

        const outsideIds = allValidItemIds.filter((id) => !r1Set.has(id) && !r2Set.has(id));
        if (outsideIds.length < 2) continue;

        // Enforce unique name constraint across all 9 items
        const usedNames = new Set<string>();

        const intersectIds = pickUniqueNames(intersectionIds, 1, usedNames, validItemsMap);
        if (!intersectIds) continue;

        const r1Items = pickUniqueNames(r1ExclusiveIds, 3, usedNames, validItemsMap);
        if (!r1Items) continue;

        const r2Items = pickUniqueNames(r2ExclusiveIds, 3, usedNames, validItemsMap);
        if (!r2Items) continue;

        const outItems = pickUniqueNames(outsideIds, 2, usedNames, validItemsMap);
        if (!outItems) continue;

        // Valid game structure found
        found = true;
        selectedRule1 = r1;
        selectedRule2 = r2;
        finalIntersect = intersectIds[0];
        finalR1 = r1Items;
        finalR2 = r2Items;
        finalOut = outItems;
      }

      if (!found || !selectedRule1 || !selectedRule2) {
        errors.push(`Could not find a valid combination for entry ${i + 1} after 100 attempts.`);
        continue;
      }

      const rule1Id = selectedRule1.id;
      const rule2Id = selectedRule2.id;

      // Remove used rules from queue
      availableRules = availableRules.filter((r) => r.id !== rule1Id && r.id !== rule2Id);

      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      // Track usage for history update
      used.push(rule1Id, rule2Id);

      // Use first item from each exclusive array as example
      const rule1ExampleId = finalR1[0];
      const rule2ExampleId = finalR2[0];
      const finalR1Board = finalR1.slice(1);
      const finalR2Board = finalR2.slice(1);

      // Build remaining items array
      const combinedThings = shuffle([
        ...finalR1Board.map((tid) => ({ id: tid, name: validItemsMap.get(tid)?.name ?? 'Unknown', rule: 1 })),
        ...finalR2Board.map((tid) => ({ id: tid, name: validItemsMap.get(tid)?.name ?? 'Unknown', rule: 2 })),
        ...finalOut.map((tid) => ({ id: tid, name: validItemsMap.get(tid)?.name ?? 'Unknown', rule: 3 })),
      ]);

      // Build title

      const title = [
        RULE_TYPE_TITLES?.[rules[selectedRule1.id].type] ?? 'Desconhecido',
        RULE_TYPE_TITLES?.[rules[selectedRule2.id].type] ?? 'Desconhecido',
      ].join(' vs ');

      entries[id] = {
        id,
        number: latestNumber,
        type: 'conjuntos',
        title,
        level: Math.max(selectedRule1.level, selectedRule2.level),
        setId: 'conjuntos',
        rule1: {
          id: rule1Id,
          text: selectedRule1.title,
          level: selectedRule1.level,
          thing: {
            id: rule1ExampleId,
            name: validItemsMap.get(rule1ExampleId)?.name ?? 'Unknown',
          },
        },
        rule2: {
          id: rule2Id,
          text: selectedRule2.title,
          level: selectedRule2.level,
          thing: {
            id: rule2ExampleId,
            name: validItemsMap.get(rule2ExampleId)?.name ?? 'Unknown',
          },
        },
        intersectingThing: {
          id: finalIntersect,
          name: validItemsMap.get(finalIntersect)?.name ?? 'Unknown',
        },
        things: combinedThings,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.conjuntos) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Conjuntos generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType: 'add' as const,
    },
  };
};
