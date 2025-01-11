import { keys, random, sample, sampleSize, shuffle, values } from 'lodash';
import type { ItemAttributesValues, ItemAttribute, Item } from 'types';
import { makeArray } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import type { DailyComunicacaoAlienigenaEntry, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export const buildDailyComunicacaoAlienigenaGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  attributes: Dictionary<ItemAttribute>,
  attributeValues: Dictionary<ItemAttributesValues>,
  items: Dictionary<Item>,
  updateWarnings: (warning: string) => void,
) => {
  console.count('Creating Comunicacao Alienigena...');
  let lastDate = history.latestDate;

  const allAttributes = values(attributes).filter((attr) => !attr.limited && items?.[attr.id]?.nsfw !== true);
  const allAttributesValues = values(attributeValues).filter((i) => i.complete);

  const preliminaryEntries: Dictionary<DailyComunicacaoAlienigenaEntry> = {};
  let tries = 0;
  while (keys(preliminaryEntries).length < batchSize && tries < 100) {
    const entry = generateComunicacaoAlienigenaGame(allAttributes, allAttributesValues);
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
    updateWarnings('Not enough valid comunicacao alienigena games (over 100 attempts)');
  }

  const entries: Dictionary<DailyComunicacaoAlienigenaEntry> = {};
  Object.values(preliminaryEntries).forEach((entry, index) => {
    const id = getNextDay(lastDate);
    lastDate = id;

    entries[id] = {
      ...entry,
      id,
      number: history.latestNumber + index + 1,
    };
  });

  return entries;
};

const generateComunicacaoAlienigenaGame = (
  attributes: ItemAttribute[],
  attributeValues: ItemAttributesValues[],
): DailyComunicacaoAlienigenaEntry => {
  const shuffledAttributeValues = shuffle(attributeValues);

  const spriteIDs = shuffle(makeArray(38, 0));

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
      return none.push(item.id);
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

  const gameAttributes: DailyComunicacaoAlienigenaEntry['attributes'] = selectedAttributes.map((attr) => ({
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

  const complexRequests: DailyComunicacaoAlienigenaEntry['requests'] = [];
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
  const simpleRequests: DailyComunicacaoAlienigenaEntry['requests'] = [];
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
    console.log('🔆 Not enough requests for an alien communication, marking as invalid');
  }

  requests = shuffle(requests);

  const requestItemsIds: string[] = requests.map((req) => req.itemId);

  const result: DailyComunicacaoAlienigenaEntry = {
    id: '0000-00-00',
    setId: gameAttributes
      .map((attr) => attr.id)
      .sort()
      .join('-'),
    number: 0,
    type: 'comunicação-alienígena',
    attributes: gameAttributes,
    requests,
    solution: requestItemsIds.join('-'),
    itemsIds: shuffle([
      ...requestItemsIds,
      ...sampleSize([none[0], none[1], none[2], none[3]], random(1, 3)),
    ]).filter(Boolean),
    valid: false,
  };

  // Validate game
  result.valid = [
    result.attributes.length === 3,
    result.requests.length === 4,
    result.itemsIds.length > 4,
    result.attributes.every((attr) => attr.itemsIds.length > 0),
    result.requests.every((req) => req.itemId),
  ].every(Boolean);

  return result;
};
