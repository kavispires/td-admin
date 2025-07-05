import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, cloneDeep, orderBy, sample, sampleSize, set, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyQuartetSet, ItemGroup } from 'types';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import { addWarning } from '../warnings';

type QuartetosSet = {
  id: string;
  title: string;
  itemsIds: string[];
  level: number;
};

export type DailyQuartetosEntry = {
  id: DateKey;
  setId: string;
  number: number;
  type: 'quartetos';
  grid: string[]; // 4x4
  difficulty: number;
  sets: QuartetosSet[];
};

export const useDailyQuartetosGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [quartetosHistory] = useParsedHistory(DAILY_GAMES_KEYS.QUARTETOS, dailyHistory);

  const dailyQuartetSetQuery = useTDResource<DailyQuartetSet>('daily-quartet-sets', enabled);
  const itemGroupsQuery = useTDResource<ItemGroup>('items-groups', enabled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || dailyQuartetSetQuery.isLoading || itemGroupsQuery.isLoading || !quartetosHistory) {
      return {};
    }

    return buildDailyQuartetosGames(
      batchSize,
      quartetosHistory,
      queryLanguage,
      dailyQuartetSetQuery.data,
      itemGroupsQuery.data,
    );
  }, [
    enabled,
    queryLanguage,
    quartetosHistory,
    batchSize,
    dailyQuartetSetQuery.dataUpdatedAt,
    itemGroupsQuery.dataUpdatedAt,
  ]);

  return {
    entries,
    isLoading: dailyQuartetSetQuery.isLoading || itemGroupsQuery.isLoading,
  };
};

export const buildDailyQuartetosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  queryLanguage: Language,
  quartetsSets: Dictionary<DailyQuartetSet>,
  itemsGroups: Dictionary<ItemGroup>,
) => {
  console.count('Creating Quartetos...');

  // Filter out any incomplete sets and used sets
  let eligibleSets = Object.values(quartetsSets).filter(
    (setEntry) => setEntry.itemsIds.length >= 4 && !history.used.includes(setEntry.id) && !setEntry.flagged,
  );

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyQuartetosEntry> = {};
  Array.from({ length: batchSize }).forEach((_, i) => {
    // for (let i = 0; i < batchSize; i++) {
    // The game always consists of 3 quartets sets and 1 random group entry
    const sets: QuartetosSet[] = [];

    const takenItemsIds: BooleanDictionary = {};

    // Within the game, we need to keep track of the selected sets so items do override each other
    let scopedEligibleSets = cloneDeep(eligibleSets);

    const perfectSets = scopedEligibleSets.filter((set) => set.itemsIds.length === 4);
    if (perfectSets.length === 0) {
      addWarning('quartet', 'No perfect sets found for Quartetos game');
      return entries;
    }

    let tries = 0;
    // Get 3 sets with unique items
    while (sets.length < 3 && tries < 1000) {
      tries++;
      const referenceSet = sample(perfectSets);
      console.log({ referenceSet });

      if (!referenceSet) {
        addWarning('quartet', 'No reference set found for Quartetos game');
        return entries;
      }

      // Group sets that matches each element of the perfect reference set
      const relatedSets = gatherRelatedSets(referenceSet.itemsIds, quartetsSets);
      console.log({ relatedSets });
      if (
        relatedSets[0].length === 0 &&
        relatedSets[1].length === 0 &&
        relatedSets[2].length === 0 &&
        relatedSets[3].length === 0
      ) {
        console.log(`No related sets found for reference set ${referenceSet.id}`);
        continue;
      }

      // Remove reference set from scopedEligibleSets
      scopedEligibleSets = scopedEligibleSets.filter((set) => set.id !== referenceSet.id);

      for (let r = 0; r < relatedSets.length; r++) {
        console.log(`Processing related sets for item ${r + 1} of 4`);
        const primaryItemId = referenceSet.itemsIds[r];
        takenItemsIds[primaryItemId] = true; // Mark primary item as taken
        const relatedSet = relatedSets[r];

        // Loop through sets until find one that does not have collisions with taken items
        for (let j = 0; j < relatedSet.length - 1; j++) {
          const potentialSet = relatedSet[j];
          if (!potentialSet) {
            console.log(`No related set found for item ${primaryItemId} [${j}]`);
            continue; // No related set found for this item
          }

          // If after removing the primary item, the set has 3 items that doesn't collide with taken items, we can use it
          const availableSetItemsIds = potentialSet.itemsIds.filter((id) => id !== primaryItemId);
          // Verify collision with taken items
          let collisionsCount = 0;
          const selectedSetItemsIds = availableSetItemsIds.filter((id) => {
            if (takenItemsIds[id]) {
              collisionsCount++;
              return false;
            }
            return true;
          });

          if (selectedSetItemsIds.length < 3 || collisionsCount > 2) {
            console.log(`Not enough available items or too many collisions for item ${primaryItemId} [${j}]`);
            continue; // Not enough available items, try next set
          }

          // Add all items to taken
          potentialSet.itemsIds.forEach((id) => {
            takenItemsIds[id] = true;
          });

          console.log(`Adding set ${potentialSet.id} for item ${primaryItemId} [${j}]`);

          sets.push({
            id: potentialSet.id,
            title: potentialSet.title,
            itemsIds: [primaryItemId, ...sampleSize(selectedSetItemsIds, 3)],
            level: potentialSet.level ?? 1,
          });

          break; // Found a valid set, break the loop
        }

        if (sets.length >= 3) {
          break; // We have enough sets, break the outer loop
        }

        // If there are less than 3 sets, add sets with no collisions (from none)
        if (sets.length < 3) {
          while (sets.length < 3 && relatedSets[relatedSets.length - 1].length > 0) {
            const noneSet = relatedSets[relatedSets.length - 1].pop();
            if (!noneSet) {
              console.log(`No none set found for item position ${sets.length}`);
              continue; // No none set found for this item
            }

            // Check if the set has any collisions with taken items
            const availableSetItemsIds = noneSet.itemsIds.filter((id) => !takenItemsIds[id]);
            if (availableSetItemsIds.length < 3) {
              console.log(`Not enough available items left for item position ${sets.length}`);
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
          }
        }
      }
    }

    // Remove selected sets from eligibleSets
    if (sets.length === 3) {
      const selectedSetsIds = sets.map((set) => set.id);
      eligibleSets = eligibleSets.filter((set) => !selectedSetsIds.includes(set.id));

      // Get a group that does not share any items with the selected sets
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
    }
    const difficulty = Math.ceil(sets.reduce((acc, set) => acc + set.level, 0) / sets.length);

    const orderedSets = orderBy(sets, ['level'], ['asc']).map((set, index) => {
      set.level = index;
      return set;
    });
    const setId = sets.map((set) => set.id).join(SEPARATOR);
    const grid = shuffle(sets.flatMap((set) => set.itemsIds));

    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      number: history.latestNumber + i + 1,
      setId,
      type: 'quartetos',
      grid,
      difficulty,
      sets: orderedSets,
    };
  });

  return entries;
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
