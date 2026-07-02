/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import type { DailyQuartetSet, ItemGroupData } from '@types';
import { SEPARATOR } from '@utils/constants';
import { capitalize, cloneDeep, orderBy, sample, sampleSize, shuffle } from 'lodash';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

type QuartetosSet = {
  /**
   * Set identifier
   */
  id: string;
  /**
   * Set title
   */
  title: string;
  /**
   * Item IDs in this set
   */
  itemsIds: string[];
  /**
   * Difficulty level (0-3)
   */
  level: number;
};

export type DailyQuartetosEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Combined set identifier
   */
  setId: string;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'quartetos';
  /**
   * Shuffled 4x4 grid of item IDs
   */
  grid: string[];
  /**
   * Overall difficulty (1-3)
   */
  difficulty: number;
  /**
   * Four sets forming the puzzle
   */
  sets: QuartetosSet[];
};

/**
 * Hook for generating daily Quartetos games
 *
 * Creates 4x4 grid puzzles where players group 16 items into 4 sets of 4.
 * Uses 3 curated quartet sets plus either a wildcard group or a 4th curated set.
 * Employs history recycling and anti-intersection ordering to maximize variety.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for set titles
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used sets
 * @returns Generated Quartetos game entries with history updates
 */
export const useDailyQuartetosGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyQuartetosEntry> => {
  // Fetch prerequisite data
  const [quartetosHistory] = useParsedHistory(DAILY_GAMES_KEYS.QUARTETOS, dailyHistory);
  const dailyQuartetSetQuery = useTDResource<DailyQuartetSet>('daily-quartet-sets', { enabled });
  const itemGroupsQuery = useTDResource<ItemGroupData>('items-groups', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled && dailyQuartetSetQuery.isSuccess && itemGroupsQuery.isSuccess && !!quartetosHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'quartetos',
      batchSize,
      queryLanguage,
      dailyQuartetSetQuery.dataUpdatedAt,
      itemGroupsQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!quartetosHistory || !dailyQuartetSetQuery.data || !itemGroupsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyQuartetosGamesRandom(
        batchSize,
        quartetosHistory,
        queryLanguage,
        dailyQuartetSetQuery.data,
        itemGroupsQuery.data,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || dailyQuartetSetQuery.isLoading || itemGroupsQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: quartetosHistory?.latestDate ?? '',
      latestNumber: quartetosHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

export const buildDailyQuartetosGamesRandom = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  queryLanguage: Language,
  quartetsSets: Dictionary<DailyQuartetSet>,
  itemsGroups: Dictionary<ItemGroupData>,
) => {
  if (debugDailyStore.state.quartetos) {
    console.count('Creating Quartetos...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyQuartetosEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // 1. Get all valid sets, regardless of history
    const allValidSets = Object.values(quartetsSets).filter(
      (setEntry) => setEntry.itemsIds.length >= 4 && !setEntry.flagged,
    );

    if (allValidSets.length === 0) {
      throw new Error('Critical: No valid Quartetos sets found in the database.');
    }

    // 2. Filter out used sets for our initial fresh pool
    let eligibleSets = shuffle(allValidSets.filter((setEntry) => !history.used.includes(setEntry.id)));

    // 3. HISTORY RECYCLING: Guarantee we have enough sets for the batch
    // A batch needs exactly 3 curated sets per day, and potentially a 4th fallback.
    const requiredSets = batchSize * 4;
    if (eligibleSets.length < requiredSets) {
      if (debugDailyStore.state.quartetos) {
        console.log('🔆 Not enough fresh quartetos sets left, recycling...');
      }
      errors.push('Not enough fresh sets. Recycling historical data.');
      const needed = requiredSets - eligibleSets.length;

      // Grab historical sets, prioritizing ones not already in our eligible pool
      const recycledPool = shuffle(
        allValidSets.filter((setEntry) => !eligibleSets.some((es) => es.id === setEntry.id)),
      );

      // If the database is extremely small, allow duplicates to fulfill the requirement
      while (eligibleSets.length + recycledPool.length < requiredSets) {
        recycledPool.push(...shuffle(allValidSets));
      }

      eligibleSets = [...eligibleSets, ...recycledPool.slice(0, needed)];
    }

    // 4. Order them to avoid intersection, and treat it as a consumable "deck"
    const availableCuratedSets = orderSetsWithoutIntersection(eligibleSets, 5);

    for (let i = 0; i < batchSize; i++) {
      const sets: QuartetosSet[] = [];
      const takenItemsIds: BooleanDictionary = {};

      // 5. Add 3 curated quartets by shifting them off the top of our deck
      for (let j = 0; j < 3; j++) {
        const set = availableCuratedSets.shift();
        if (set) {
          const selectedItems = sampleSize(set.itemsIds, 4);
          sets.push({
            id: set.id,
            title: set.title,
            itemsIds: selectedItems,
            level: set.level ?? 1,
          });
          used.push(set.id);
          selectedItems.forEach((id) => {
            takenItemsIds[id] = true;
          });
        }
      }

      // 6. WILDCARD SEARCH: Strict constraints applied
      const availableGroups = shuffle(Object.values(itemsGroups)).filter((group) => {
        // Must have >= 10 items AND 0% collision with the current board
        return group.itemsIds.length >= 10 && !group.itemsIds.some((itemId) => takenItemsIds[itemId]);
      });

      if (availableGroups.length > 0) {
        // Success! We found a safe wildcard group.
        const randomGroup = availableGroups[0];
        sets.push({
          id: randomGroup.id,
          title: `${capitalize(randomGroup.name[queryLanguage])}*`,
          itemsIds: sampleSize(randomGroup.itemsIds, 4),
          level: 1,
        });
        used.push(randomGroup.id);
      } else {
        // 7. SAFE FALLBACK: If wildcard fails, pull a 4th curated set
        if (debugDailyStore.state.quartetos) {
          console.warn(`No safe wildcard found for day ${i + 1}. Falling back to 4th curated set.`);
        }

        // Find a backup set from our deck that ALSO has 0% collision with the board
        const fallbackIndex = availableCuratedSets.findIndex(
          (set) => !set.itemsIds.some((id) => takenItemsIds[id]),
        );

        if (fallbackIndex !== -1) {
          // Remove it from the deck and use it
          const fallbackSet = availableCuratedSets.splice(fallbackIndex, 1)[0];
          sets.push({
            id: fallbackSet.id,
            title: fallbackSet.title,
            itemsIds: sampleSize(fallbackSet.itemsIds, 4),
            level: fallbackSet.level ?? 1,
          });
          used.push(fallbackSet.id);
        }
      }

      // 8. Absolute safety check
      if (sets.length < 4) {
        throw new Error(`Kaboom! Complete data exhaustion. Cannot complete a 4x4 grid for day ${i + 1}.`);
      }

      const difficulty = Math.ceil(sets.reduce((acc, set) => acc + set.level, 0) / sets.length);

      const orderedSets = orderBy(sets, ['level'], ['asc']).map((set, index) => {
        set.level = index;
        return set;
      });
      const setId = sets.map((set) => set.id).join(SEPARATOR);
      const grid = shuffle(sets.flatMap((set) => set.itemsIds));

      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      entries[id] = {
        id,
        number: latestNumber,
        setId,
        type: 'quartetos',
        grid,
        difficulty,
        sets: orderedSets,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.quartetos) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Quartetos generation.');
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

/**
 * Legacy builder for daily Quartetos games
 *
 * Original algorithm using perfect sets as references and gathering related sets.
 * Retained for backward compatibility.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used sets
 * @param queryLanguage - Target language for set titles
 * @param quartetsSets - Available quartet sets
 * @param itemsGroups - Available item groups for wildcards
 * @returns Generated entries, errors, and history update
 */
export const buildDailyQuartetosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  queryLanguage: Language,
  quartetsSets: Dictionary<DailyQuartetSet>,
  itemsGroups: Dictionary<ItemGroupData>,
) => {
  if (debugDailyStore.state.quartetos) {
    console.count('Creating Quartetos (Legacy)...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyQuartetosEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Filter out incomplete and used sets
    let eligibleSets = Object.values(quartetsSets).filter(
      (setEntry) => setEntry.itemsIds.length >= 4 && !history.used.includes(setEntry.id) && !setEntry.flagged,
    );

    for (let i = 0; i < batchSize; i++) {
      const sets: QuartetosSet[] = [];
      const takenItemsIds: BooleanDictionary = {};

      // Track selected sets to prevent item overlap
      let scopedEligibleSets = cloneDeep(eligibleSets);

      const perfectSets = scopedEligibleSets.filter((set) => set.itemsIds.length === 4);
      if (perfectSets.length === 0) {
        throw new Error('No perfect sets found for Quartetos game');
      }

      let tries = 0;
      // Find 3 sets with unique items
      while (sets.length < 3 && tries < ATTEMPTS_THRESHOLD) {
        tries++;
        const referenceSet = sample(perfectSets);

        if (!referenceSet) {
          throw new Error('No reference set found for Quartetos game');
        }

        // Gather sets related to each element of the reference set
        const relatedSets = gatherRelatedSets(referenceSet.itemsIds, quartetsSets);

        if (
          relatedSets[0].length === 0 &&
          relatedSets[1].length === 0 &&
          relatedSets[2].length === 0 &&
          relatedSets[3].length === 0
        ) {
          if (debugDailyStore.state.quartetos) {
            console.log(`No related sets found for reference set ${referenceSet.id}`);
          }
          continue;
        }

        // Remove reference set from available pool
        scopedEligibleSets = scopedEligibleSets.filter((set) => set.id !== referenceSet.id);

        for (let r = 0; r < relatedSets.length; r++) {
          if (debugDailyStore.state.quartetos) {
            console.log(`Processing related sets for item ${r + 1} of 4`);
          }
          const primaryItemId = referenceSet.itemsIds[r];
          takenItemsIds[primaryItemId] = true;
          const relatedSet = relatedSets[r];

          // Find set without item collisions
          for (let j = 0; j < relatedSet.length - 1; j++) {
            const potentialSet = relatedSet[j];
            if (!potentialSet) {
              if (debugDailyStore.state.quartetos) {
                console.log(`No related set found for item ${primaryItemId} [${j}]`);
              }
              continue;
            }

            // Check if set has 3 non-colliding items after removing primary
            const availableSetItemsIds = potentialSet.itemsIds.filter((id) => id !== primaryItemId);
            let collisionsCount = 0;
            const selectedSetItemsIds = availableSetItemsIds.filter((id) => {
              if (takenItemsIds[id]) {
                collisionsCount++;
                return false;
              }
              return true;
            });

            if (selectedSetItemsIds.length < 3 || collisionsCount > 2) {
              if (debugDailyStore.state.quartetos) {
                console.log(
                  `Not enough available items or too many collisions for item ${primaryItemId} [${j}]`,
                );
              }
              continue;
            }

            // Mark all items as taken
            potentialSet.itemsIds.forEach((id) => {
              takenItemsIds[id] = true;
            });

            if (debugDailyStore.state.quartetos) {
              console.log(`Adding set ${potentialSet.id} for item ${primaryItemId} [${j}]`);
            }

            sets.push({
              id: potentialSet.id,
              title: potentialSet.title,
              itemsIds: [primaryItemId, ...sampleSize(selectedSetItemsIds, 3)],
              level: potentialSet.level ?? 1,
            });
            used.push(potentialSet.id);

            break;
          }

          if (sets.length >= 3) {
            break;
          }

          // Add sets with no collisions if needed
          if (sets.length < 3) {
            while (sets.length < 3 && relatedSets[relatedSets.length - 1].length > 0) {
              const noneSet = relatedSets[relatedSets.length - 1].pop();
              if (!noneSet) {
                if (debugDailyStore.state.quartetos) {
                  console.log(`No none set found for item position ${sets.length}`);
                }
                continue; // No none set found for this item
              }

              // Check if the set has any collisions with taken items
              const availableSetItemsIds = noneSet.itemsIds.filter((id) => !takenItemsIds[id]);
              if (availableSetItemsIds.length < 3) {
                if (debugDailyStore.state.quartetos) {
                  console.log(`Not enough available items left for item position ${sets.length}`);
                }
                continue; // Not enough available items, try next set
              }

              // Add all items to taken
              noneSet.itemsIds.forEach((id) => {
                takenItemsIds[id] = true;
              });

              sets.push({
                id: noneSet.id,
                title: noneSet.title,
                itemsIds: sampleSize(availableSetItemsIds, 4),
                level: noneSet.level ?? 1,
              });
              used.push(noneSet.id);
            }
          }
        }
      }

      // Finalize with wildcard group
      if (sets.length === 3) {
        const selectedSetsIds = sets.map((set) => set.id);
        eligibleSets = eligibleSets.filter((set) => !selectedSetsIds.includes(set.id));

        // Find group with no item overlap
        const eligibleGroups = Object.values(itemsGroups).filter(
          (group) =>
            group.itemsIds.some((id) => !takenItemsIds[id]) &&
            group.itemsIds.length >= 4 &&
            group.nsfw !== true,
        );
        const selectedGroup = sample(eligibleGroups);
        if (!selectedGroup) {
          throw Error('No eligible group found for Quartetos game');
        }
        sets.push({
          id: selectedGroup.id,
          title: `${capitalize(selectedGroup.name[queryLanguage])}*`,
          itemsIds: sampleSize(selectedGroup.itemsIds, 4),
          level: 1,
        });
        used.push(selectedGroup.id);
      } else {
        throw new Error(`Failed to find 3 valid sets for day ${i + 1}`);
      }

      const difficulty = Math.ceil(sets.reduce((acc, set) => acc + set.level, 0) / sets.length);

      const orderedSets = orderBy(sets, ['level'], ['asc']).map((set, index) => {
        set.level = index;
        return set;
      });
      const setId = sets.map((set) => set.id).join(SEPARATOR);
      const grid = shuffle(sets.flatMap((set) => set.itemsIds));

      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      entries[id] = {
        id,
        number: latestNumber,
        setId,
        type: 'quartetos',
        grid,
        difficulty,
        sets: orderedSets,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.quartetos) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Legacy Quartetos generation.');
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

function gatherRelatedSets(mainItems: string[], allSets: Dictionary<DailyQuartetSet>) {
  const [item0, item1, item2, item3] = mainItems;
  // For each of the 4 main items, find sets that share exactly one item with the main set, keep track also of the ones that don't share any items
  const relatedSets: Dictionary<DailyQuartetSet[]> = {
    [item0]: [],
    [item1]: [],
    [item2]: [],
    [item3]: [],
    none: [],
  };

  Object.values(allSets).forEach((set) => {
    if (set.itemsIds.length < 4) return; // Skip sets with less than 4 items
    if (set.flagged) return; // Skip flagged sets

    const isItem0Match = set.itemsIds.includes(item0);
    const isItem1Match = set.itemsIds.includes(item1);
    const isItem2Match = set.itemsIds.includes(item2);
    const isItem3Match = set.itemsIds.includes(item3);

    if (isItem0Match && !isItem1Match && !isItem2Match && !isItem3Match) {
      relatedSets[item0].push(set);
    } else if (isItem1Match && !isItem0Match && !isItem2Match && !isItem3Match) {
      relatedSets[item1].push(set);
    } else if (isItem2Match && !isItem0Match && !isItem1Match && !isItem3Match) {
      relatedSets[item2].push(set);
    } else if (isItem3Match && !isItem0Match && !isItem1Match && !isItem2Match) {
      relatedSets[item3].push(set);
    } else if (!isItem0Match && !isItem1Match && !isItem2Match && !isItem3Match && set.itemsIds.length >= 4) {
      relatedSets.none.push(set);
    }
  });

  return Object.values(relatedSets).map((s) => shuffle(s));
}

/**
 * Orders sets in a way that each set has no intersection with at least 5 previous sets
 * @param sets The sets to order
 * @param minGap The minimum number of sets that should have no intersection
 * @returns Ordered sets
 */
const orderSetsWithoutIntersection = (sets: DailyQuartetSet[], minGap = 5): DailyQuartetSet[] => {
  if (sets.length <= 1) return sets;

  const result: DailyQuartetSet[] = [sets[0]]; // Start with the first set
  const remaining = sets.slice(1);

  // For each position in the result array
  while (remaining.length > 0) {
    // Get all items in the last 'minGap' sets (or all if less than minGap)
    const recentItemsSet = new Set<string>();
    const lookBackCount = Math.min(result.length, minGap);

    for (let i = 1; i <= lookBackCount; i++) {
      const recentSet = result[result.length - i];
      recentSet.itemsIds.forEach((id) => {
        recentItemsSet.add(id);
      });
    }

    // Find the first set that doesn't intersect with recent items
    let foundNonIntersecting = false;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const hasIntersection = candidate.itemsIds.some((id) => recentItemsSet.has(id));

      if (!hasIntersection) {
        // Add this set to the result and remove it from remaining
        result.push(candidate);
        remaining.splice(i, 1);
        foundNonIntersecting = true;
        break;
      }
    }

    // If no non-intersecting set found, just take the first remaining set
    if (!foundNonIntersecting && remaining.length > 0) {
      result.push(remaining[0]);
      remaining.splice(0, 1);
    }
  }

  return result;
};
