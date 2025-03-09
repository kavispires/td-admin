import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, cloneDeep, orderBy, sample, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyQuartetSet, ItemGroup } from 'types';
import { removeDuplicates } from 'utils';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

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
  }, [enabled, queryLanguage, quartetosHistory, batchSize, dailyQuartetSetQuery, itemGroupsQuery]);

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

    let tries = 0;
    // Get 3 sets with unique items
    while (sets.length < 3 && tries < 500) {
      const potentialSet = sample(scopedEligibleSets);
      if (!potentialSet) {
        throw Error('No potential set found for Quartetos game');
      }
      // Remove selected set from scopedEligibleSets
      scopedEligibleSets = scopedEligibleSets.filter((set) => set.id !== potentialSet.id);

      // Each quartet needs only 4 items
      const selectedSetItemsIds = orderBy(sampleSize(potentialSet.itemsIds, 4), (id) => Number(id));

      // If any of those items was already taken, this quartet is invalid
      if (selectedSetItemsIds.some((id) => takenItemsIds[id])) {
        tries++;
        continue;
      }

      // Add all items to taken
      potentialSet.itemsIds.forEach((id) => {
        takenItemsIds[id] = true;
      });

      sets.push({
        id: potentialSet.id,
        title: potentialSet.title,
        itemsIds: selectedSetItemsIds,
        level: potentialSet.level ?? 1,
      });

      tries = 0;
    }

    // Remove selected sets from eligibleSets
    const selectedSetsIds = sets.map((set) => set.id);
    eligibleSets = eligibleSets.filter((set) => !selectedSetsIds.includes(set.id));

    // Get a group that does not share any items with the selected sets
    const eligibleGroups = Object.values(itemsGroups).filter(
      (group) => group.itemsIds.some((id) => !takenItemsIds[id]) && group.itemsIds.length >= 4,
    );
    const selectedGroup = sample(eligibleGroups);
    if (!selectedGroup) {
      throw Error('No eligible group found for Quartetos game');
    }
    sets.push({
      id: selectedGroup.id,
      title: capitalize(selectedGroup.name[queryLanguage]),
      itemsIds: sampleSize(selectedGroup.itemsIds, 4),
      level: 1,
    });

    const difficulty = Math.ceil(sets.reduce((acc, set) => acc + set.level, 0) / sets.length);

    const orderedSets = orderBy(sets, ['level'], ['desc']).map((set, index) => {
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

export const gatherUsedQuartetosEntries = (previousHistory: string[], currentData: DailyQuartetosEntry[]) => {
  return removeDuplicates([
    ...previousHistory,
    ...currentData.flatMap((entry) => entry.sets.map((set) => set.id)),
  ]);
};
