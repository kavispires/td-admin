import { DailyTeoriaDeConjuntosEntry, ParsedDailyHistoryEntry } from '../types';
import { capitalize, difference, intersection, sample, sampleSize, shuffle } from 'lodash';
import { getNextDay } from '../utils';
import { DailyDiagramItem, DailyDiagramRule } from 'types';

export const buildDailyTeoriaDeConjuntosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  rules: Dictionary<DailyDiagramRule>,
  things: Dictionary<DailyDiagramItem>
) => {
  console.count('Creating Teoria de Conjuntos...');
  let lastDate = history.latestDate;
  const used: string[] = [...history.used];

  const thingsByRules = (() => {
    const dict = Object.values(rules).reduce((acc: Record<string, string[]>, rule) => {
      acc[rule.id] = [];
      return acc;
    }, {});

    Object.values(things).forEach((entry) => {
      entry.rules.forEach((ruleId) => {
        dict[ruleId].push(entry.itemId);
      });
    });
    return dict;
  })();

  const entries: Dictionary<DailyTeoriaDeConjuntosEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);

    lastDate = id;
    entries[id] = {
      id,
      type: 'teoria-de-conjuntos',
      number: history.latestNumber + i + 1,
      ...getRuleSet(things, thingsByRules, rules, used),
    };
  }
  return entries;
};

function getRuleSet(
  things: Dictionary<DailyDiagramItem>,
  thingsByRules: Record<string, string[]>,
  rules: Dictionary<DailyDiagramRule>,
  used: string[]
) {
  const availableThingsIds = shuffle(Object.keys(things).filter((id) => !used.includes(id)));

  // Get one random initial thing
  const initialThingId = sample(availableThingsIds);
  if (!initialThingId) throw new Error('No available things to choose from');
  used.push(initialThingId);

  const title = capitalize(things[initialThingId].name);
  const intersectingThing = {
    id: initialThingId,
    name: things[initialThingId].name,
  };

  // Get two random rules belonging to the thing
  const selectedRules = sampleSize(things[initialThingId].rules, 2);
  const ruleId = `${selectedRules[0]}-${selectedRules[1]}`;
  if (selectedRules.length !== 2) throw new Error('No rules found for this thing');
  used.push(ruleId);
  const level = rules[selectedRules[0]].level + rules[selectedRules[1]].level - 1;

  const itemsOnlyInRule1 = shuffle(
    difference(thingsByRules[selectedRules[0]], thingsByRules[selectedRules[1]])
  );

  const itemsOnlyInRule2 = shuffle(
    difference(thingsByRules[selectedRules[1]], thingsByRules[selectedRules[0]])
  );

  const commonItems = shuffle(intersection(thingsByRules[selectedRules[0]], thingsByRules[selectedRules[1]]));

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

  // Get up to 4 unique things that fit both rules, if possible
  const sampleCommonThings = sampleSize(commonItems, 4);
  const sampleRule1Things = sampleSize(itemsOnlyInRule1, 8);
  const sampleRule2Things = sampleSize(itemsOnlyInRule2, 8);
  const gabarito: Record<string, number> = {};
  sampleCommonThings.forEach((id) => (gabarito[id] = 0));
  sampleRule1Things.forEach((id) => (gabarito[id] = 1));
  sampleRule2Things.forEach((id) => (gabarito[id] = 2));

  // Sample 8 things among the options
  const selectionIds = sampleSize([...sampleCommonThings, ...sampleRule1Things, ...sampleRule2Things], 8);

  const selectedThings = selectionIds.map((id) => ({
    id,
    name: things[id].name,
    rule: gabarito[id],
  }));

  // Create the DailyTeoriaDeConjuntosEntry object
  const entry: Omit<DailyTeoriaDeConjuntosEntry, 'id' | 'type' | 'number'> = {
    title,
    level,
    rule1,
    rule2,
    intersectingThing,
    things: selectedThings,
  };
  return entry;
}
