import { capitalize, orderBy, sample, sampleSize, shuffle } from 'lodash';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import type { DailyQuartetSet, ItemGroup } from 'types';
import { SEPARATOR } from 'utils/constants';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { DAILY_GAMES_KEYS } from '../constants';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import { removeDuplicates } from 'utils';

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
  _updateWarnings: (warning: string) => void,
) => {
  const [quartetosHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, dailyHistory);

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
    (setEntry) => setEntry.itemsIds.length >= 4 && !history.used.includes(setEntry.id),
  );

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyQuartetosEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    // The game always consists of 3 quartets sets and 1 random group entry
    const takenItemsIds: string[] = [];
    // Get 3 sets
    const sets: QuartetosSet[] = sampleSize(eligibleSets, 3).map((set) => {
      takenItemsIds.push(...set.itemsIds);
      return {
        id: set.id,
        title: set.title,
        itemsIds: sampleSize(set.itemsIds, 4),
        level: set.level,
      };
    });
    const selectedSetsIds = sets.map((set) => set.id);

    // Remove selected sets from eligibleSets
    eligibleSets = eligibleSets.filter((set) => !selectedSetsIds.includes(set.id));

    // Get a group that does not share any items with the selected sets
    const eligibleGroups = Object.values(itemsGroups).filter(
      (group) => !takenItemsIds.some((id) => group.itemsIds.includes(id)),
    );
    const selectedGroup = sample(eligibleGroups);
    if (!selectedGroup) {
      throw Error('No eligible group found for Quartetos game');
    }
    sets.push({
      id: selectedGroup.id,
      title: capitalize(selectedGroup.name[queryLanguage]),
      itemsIds: sampleSize(selectedGroup.itemsIds, 4),
      level: 2,
    });

    const orderedSets = orderBy(sets, ['level'], ['desc']);
    const setId = sets.map((set) => set.id).join(SEPARATOR);
    const grid = shuffle(sets.flatMap((set) => set.itemsIds));
    const difficulty = Math.ceil(sets.reduce((acc, set) => acc + set.level, 0) / sets.length);

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
  }

  return entries;
};

export const gatherUsedQuartetosEntries = (previousHistory: string[], currentData: DailyQuartetosEntry[]) => {
  return removeDuplicates([
    ...previousHistory,
    ...currentData.flatMap((entry) => entry.sets.map((set) => set.id)),
  ]);
};
