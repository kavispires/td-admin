import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { getIsThingOutdated, getLatestRuleUpdate } from 'components/Items/Diagram/utils';
import { useTDResource } from 'hooks/useTDResource';
import { difference, intersection, sample, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { addWarning } from '../warnings';

export type DailyTeoriaDeConjuntosEntry = {
  id: DateKey;
  number: number;
  type: 'teoria-de-conjuntos';
  title: string;
  level: number;
  setId: string;
  rule1: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  rule2: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  intersectingThing: {
    id: string;
    name: string;
  };
  things: {
    id: string;
    name: string;
    rule: number;
  }[];
};

export const useDailyTeoriaDeConjuntosGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [teoriaDeConjuntosHistory] = useParsedHistory(DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS, dailyHistory);

  const thingsQuery = useTDResource<DailyDiagramItem>('daily-diagram-items', { enabled });
  const rulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !teoriaDeConjuntosHistory || !thingsQuery.isSuccess || !rulesQuery.isSuccess) {
      return {};
    }

    return buildDailyTeoriaDeConjuntosGames(
      batchSize,
      teoriaDeConjuntosHistory,
      rulesQuery.data,
      thingsQuery.data,
    );
  }, [enabled, batchSize, teoriaDeConjuntosHistory, rulesQuery.dataUpdatedAt, thingsQuery.dataUpdatedAt]);

  return {
    entries,
    isLoading: thingsQuery.isLoading || rulesQuery.isLoading,
  };
};

const SELECTION_SIZE = 8;

export const buildDailyTeoriaDeConjuntosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  rules: Dictionary<DailyDiagramRule>,
  things: Dictionary<DailyDiagramItem>,
) => {
  console.count('Creating Teoria de Conjuntos...');
  let lastDate = history.latestDate;
  const used: string[] = [...history.used];

  const latestRuleUpdate = getLatestRuleUpdate(rules);

  const thingsByRules = (() => {
    const dict = Object.values(rules).reduce((acc: Record<string, string[]>, rule) => {
      acc[rule.id] = [];
      return acc;
    }, {});

    Object.values(things).forEach((entry) => {
      // Only use things that are not outdated
      if (!getIsThingOutdated(entry, latestRuleUpdate)) {
        entry.rules.forEach((ruleId) => {
          dict[ruleId].push(entry.itemId);
        });
      }
    });
    return dict;
  })();

  const entries: Dictionary<DailyTeoriaDeConjuntosEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    // Weekend have 2 more things (one to start and one for an extra mistake)
    const size = isWeekend ? SELECTION_SIZE + 2 : SELECTION_SIZE;

    lastDate = id;
    entries[id] = {
      id,
      type: 'teoria-de-conjuntos',
      number: history.latestNumber + i + 1,
      ...getRuleSet(things, thingsByRules, rules, used, latestRuleUpdate, size),
    };
  }
  return entries;
};

function getRuleSet(
  things: Dictionary<DailyDiagramItem>,
  thingsByRules: Record<string, string[]>,
  rules: Dictionary<DailyDiagramRule>,
  used: string[],
  latestRuleUpdate: number,
  size: number,
) {
  try {
    const availableThingsIds = shuffle(
      Object.keys(things).filter(
        (id) => !used.includes(id) && !getIsThingOutdated(things[id], latestRuleUpdate),
      ),
    );

    // Get one random initial thing
    const initialThingId = sample(availableThingsIds);
    if (!initialThingId) throw new Error('No available things to choose from');
    used.push(initialThingId);

    const intersectingThing = {
      id: initialThingId,
      name: things[initialThingId].name,
    };

    // Group rules by type than get a random pair of rules of different types
    const thingsRulesByType = things[initialThingId].rules.reduce((acc: Record<string, string[]>, ruleId) => {
      const type = rules[ruleId].type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(ruleId);
      return acc;
    }, {});
    // Delete any rule with less than 2 rules
    Object.keys(thingsRulesByType).forEach((type) => {
      if (thingsRulesByType[type].length < 2) delete thingsRulesByType[type];
    });

    const twoRandomTypes = sampleSize(Object.keys(thingsRulesByType), 2);

    if (twoRandomTypes.length !== 2) throw new Error('No types found for this thing');
    const selectedRules = [
      sample(thingsRulesByType[twoRandomTypes[0]]),
      sample(thingsRulesByType[twoRandomTypes[1]]),
    ];
    if (!selectedRules[0] || !selectedRules[1]) throw new Error('No rules found for this thing');

    const ruleId = [selectedRules[0], selectedRules[1]].sort().join('-');
    used.push(ruleId);

    const level = rules[selectedRules[0]].level + rules[selectedRules[1]].level - 1;

    // We don't need to modify thingsByRules since we're already filtering excluded items later

    const itemsOnlyInRule1 = shuffle(
      difference(thingsByRules[selectedRules[0]], thingsByRules[selectedRules[1]]),
    );

    const itemsOnlyInRule2 = shuffle(
      difference(thingsByRules[selectedRules[1]], thingsByRules[selectedRules[0]]),
    );

    const commonItems = shuffle(
      intersection(thingsByRules[selectedRules[0]], thingsByRules[selectedRules[1]]),
    );

    // Get one unique initial thing that only fits rule 1
    const selectedInitialThingId1 = itemsOnlyInRule1.pop();
    if (!selectedInitialThingId1) throw new Error('No only in rule 1 things to choose from');
    const rule1 = {
      id: selectedRules[0],
      text: rules[selectedRules[0]].title,
      level: rules[selectedRules[0]].level,
      thing: {
        id: selectedInitialThingId1,
        name: things[selectedInitialThingId1].name,
      },
    };

    // Get one unique initial thing that only fits rule 2
    const selectedInitialThingId2 = itemsOnlyInRule2.pop();
    if (!selectedInitialThingId2) throw new Error('No only in rule 2 things to choose from');
    const rule2 = {
      id: selectedRules[1],
      text: rules[selectedRules[1]].title,
      level: rules[selectedRules[1]].level,
      thing: {
        id: selectedInitialThingId2,
        name: things[selectedInitialThingId2].name,
      },
    };

    // Create a set of excluded items that shouldn't be in the things array
    const excludedItems = new Set([initialThingId, selectedInitialThingId1, selectedInitialThingId2]);

    // Filter out the excluded items from each array
    const filteredCommonItems = commonItems.filter((id) => !excludedItems.has(id));
    const filteredItemsOnlyInRule1 = itemsOnlyInRule1.filter((id) => !excludedItems.has(id));
    const filteredItemsOnlyInRule2 = itemsOnlyInRule2.filter((id) => !excludedItems.has(id));

    // Get up to 4 unique things that fit both rules, if possible
    const sampleCommonThings = sampleSize(filteredCommonItems, size / 2);
    const sampleRule1Things = sampleSize(filteredItemsOnlyInRule1, size);
    const sampleRule2Things = sampleSize(filteredItemsOnlyInRule2, size);
    const answerSheet: Record<string, number> = {};
    sampleCommonThings.forEach((id) => {
      answerSheet[id] = 0;
    });
    sampleRule1Things.forEach((id) => {
      answerSheet[id] = 1;
    });
    sampleRule2Things.forEach((id) => {
      answerSheet[id] = 2;
    });

    // Sample 8 things among the options, shuffleAndCombine prevents from having the first 4 items from the same rule
    const selectionIds = shuffleAndCombine(sampleCommonThings, sampleRule1Things, sampleRule2Things, size);

    const selectedThings = selectionIds.map((id) => ({
      id,
      name: things[id].name,
      rule: answerSheet[id],
    }));

    // Build title
    const TITLES: Record<string, string> = {
      contains: 'Inclusão',
      starts: 'Inicialização',
      ends: 'Terminação',
      grammar: 'Gramática',
      order: 'Sequência',
      count: 'Contagem',
      comparison: 'Comparação',
      repetition: 'Repetição',
    };

    const title = [
      TITLES?.[rules[rule1.id].type] ?? 'Desconhecido',
      TITLES?.[rules[rule2.id].type] ?? 'Desconhecido',
    ].join(' vs ');
    const setId = [rule1.id, rule2.id].sort().join('::');

    // Create the DailyTeoriaDeConjuntosEntry object
    const entry: Omit<DailyTeoriaDeConjuntosEntry, 'id' | 'type' | 'number'> = {
      title,
      setId,
      level,
      rule1,
      rule2,
      intersectingThing,
      things: selectedThings,
    };
    return entry;
  } catch (error) {
    addWarning(
      'teoria-de-conjuntos',
      `Error generating Teoria de Conjuntos rule set: ${(error as Error).message}`,
    );

    return {
      title: 'Erro na geração',
      setId: 'error',
      level: 1,
      rule1: {
        id: 'error-1',
        text: 'Erro na geração',
        level: 1,
        thing: {
          id: 'error-thing-1',
          name: 'Erro na geração',
        },
      },
      rule2: {
        id: 'error-2',
        text: 'Erro na geração',
        level: 1,
        thing: {
          id: 'error-thing-2',
          name: 'Erro na geração',
        },
      },
      intersectingThing: {
        id: 'error-intersecting-thing',
        name: 'Erro na geração',
      },
      things: [],
    };
  }
}

function shuffleAndCombine(arr1: string[], arr2: string[], arr3: string[], size: number) {
  // Get the first 3 items from each array
  const firstThreeArr1 = arr1.slice(0, 3);
  const firstThreeArr2 = arr2.slice(0, 3);
  const firstThreeArr3 = arr3.slice(0, 3);

  // Combine and shuffle the first three items from each
  let combined = sampleSize([...firstThreeArr1, ...firstThreeArr2, ...firstThreeArr3], size);

  // If the combined length is less than 9, gather remaining items
  if (combined.length < size) {
    const remainingArr1 = arr1.slice(3);
    const remainingArr2 = arr2.slice(3);
    const remainingArr3 = arr3.slice(3);

    const remaining = shuffle([...remainingArr1, ...remainingArr2, ...remainingArr3]);

    // Append remaining items to the combined list
    combined = [...combined, ...remaining];
  }

  return combined.slice(0, size);
}
