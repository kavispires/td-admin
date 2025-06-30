import { keyBy, keys, orderBy, sampleSize, shuffle, sortBy } from 'lodash';
import type { Item, ItemAttribute, ItemAttributesValues, ItemId } from 'types';

/**
 * TD ALIEN ATTRIBUTES TOOLKIT FUNCTIONS
 * Version 1.1.0
 */

/**
 * Alien Item object
 */
type AlienItem = Pick<Item, 'id' | 'name' | 'nsfw'> &
  Pick<ItemAttributesValues, 'attributes'> & {
    /**
     * The type of aliem item
     */
    type: 'ITEM' | 'CURSE' | 'BLANK';
    /**
     * Number of times the item has been inquired about
     */
    inquiries?: number;
    /**
     * List of players who offered the item
     */
    offerings: string[];
  };

/**
 * Alien Attribute object
 */
type AlienAttribute = Pick<
  ItemAttribute,
  'id' | 'name' | 'description' | 'limited' | 'spriteId' | 'priority'
> & {
  /**
   * Flag indicating if the players have been given information about this attribute
   */
  known?: boolean;
};

const ATTRIBUTE_VALUE_DICT = {
  OPPOSITE: {
    value: -10,
    prefix: '^',
    name: 'OPPOSITE',
    label: {
      en: 'Opposite',
      pt: 'Oposto',
    },
    prefixLabel: {
      en: 'really not ',
      pt: 'muito não ',
    },
  },
  UNRELATED: {
    value: -3,
    prefix: '!',
    name: 'UNRELATED',
    label: {
      en: 'Unrelated',
      pt: 'Desconexo',
    },
    prefixLabel: {
      en: 'not ',
      pt: 'não ',
    },
  },
  UNCLEAR: {
    value: -1,
    prefix: '~',
    name: 'UNCLEAR',
    label: {
      en: 'Unclear',
      pt: 'Incerto',
    },
    prefixLabel: {
      en: 'sorta ',
      pt: 'meio ',
    },
  },
  RELATED: {
    value: 5,
    prefix: '+',
    name: 'RELATED',
    label: {
      en: 'Related',
      pt: 'Relacionado',
    },
    prefixLabel: {
      en: '',
      pt: '',
    },
  },
  DETERMINISTIC: {
    value: 10,
    prefix: '*',
    name: 'DETERMINISTIC',
    label: {
      en: 'Deterministic',
      pt: 'Determinístico',
    },
    prefixLabel: {
      en: 'very ',
      pt: 'muito ',
    },
  },
};
const prefixDictionary = keyBy(ATTRIBUTE_VALUE_DICT, 'prefix');

/**
 * Creates an AlienItem object from the given item and its attribute values.
 *
 * @param item - The item to be transformed into an AlienItem.
 * @param itemAttributesValues - The attribute values associated with the item.
 * @param attributeKeysInUse - The list of attribute keys that are in use and should be included in the AlienItem.
 * @returns The newly created AlienItem object.
 */
function createAlienItem(
  item: Item,
  itemAttributesValues: ItemAttributesValues,
  attributeKeysInUse: string[],
): AlienItem {
  const itemAttributes = itemAttributesValues.attributes;
  const attributes: AlienItem['attributes'] = {};
  for (const key of attributeKeysInUse) {
    attributes[key] = itemAttributes[key];
  }

  const result: AlienItem = {
    id: item.id,
    name: item.name,
    attributes,
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  };

  if (item.nsfw) {
    result.nsfw = item.nsfw;
  }

  return result;
}

/**
 * Creates an AlienAttribute object from an ItemAttribute object.
 *
 * @param itemAttribute - The item attribute to convert.
 * @returns The created AlienAttribute object.
 */
function createAlienAttribute(itemAttribute: ItemAttribute): AlienAttribute {
  const { id, name, description, limited, spriteId, priority } = itemAttribute;

  const result: AlienAttribute = {
    id,
    name,
    description,
    spriteId,
    priority,
    known: false,
  };

  if (limited) {
    result.limited = limited;
  }

  return result;
}

/**
 * Builds alien game grids by selecting and scoring item attributes and their representative items.
 *
 * @param items - A record of items where the key is the item ID and the value is the item object.
 * @param itemAttributesValues - An array of item attribute values, each containing attributes and their values.
 * @param itemAttributes - An array of item attributes, each containing attribute metadata.
 * @param options - Additional options for building the alien game grids.
 * @param options.nsfw - Flag indicating whether to include NSFW items. (default: false)
 * @param options.itemsGridSize - The number of items to include in the grid. (default: 25)
 * @param options.attributesGridSize - The number of attributes to include in the grid. (default: 25)
 * @param options.reliability - The minimum reliability value for an item attribute to be considered. (default: 70)
 * @returns An object containing the selected attributes and their representative items.
 *
 * The function performs the following steps:
 * 1. Gathers complete items with signatures from itemAttributesValues.
 * 2. For each itemAttribute, selects a unique item where its value is deterministic (10) and reliable (reliability > 70).
 * 3. Scores each itemAttribute based on the positive values it has on each item.
 * 4. Selects the top 24 non-limited attributes by score, removing any opposite or related attribute.
 * 5. For limited itemAttributes, selects the single best limited attribute to join the final list.
 * 6. Returns the top 25 attributes and their representative items.
 */
function buildAlienGameGrids(
  items: Record<string, Item>,
  itemAttributesValues: ItemAttributesValues[],
  itemAttributes: ItemAttribute[],
  options?: {
    nsfw?: boolean;
    itemsGridSize?: number;
    attributesGridSize?: number;
    reliability?: number;
  },
) {
  const nsfw = options?.nsfw ?? false;
  const itemsGridSize = options?.itemsGridSize ?? 25;
  const attributesGridSize = options?.attributesGridSize ?? 25;
  const reliability = options?.reliability ?? 70;

  // Step 1: Gather complete items with signatures from itemAttributesValues
  const completeItems = shuffle(
    itemAttributesValues.filter(
      (itemAttrVal) =>
        itemAttrVal.complete &&
        itemAttrVal.signature &&
        (itemAttrVal.reliability ?? 0) > reliability &&
        (nsfw || !items[itemAttrVal.id].nsfw),
    ),
  );

  // Step 2: For each itemAttribute, select an unique item where its value is deterministic (10) and reliable (reliability > 80)
  const usedItems: Record<string, boolean> = {};
  const uniqueItemsPerAttribute = itemAttributes
    .map((attr) => {
      let selection: ItemAttributesValues | null = null;
      let tries = 0;
      while (tries < 500 && !selection) {
        if (tries === 499) throw new Error('Could not find a deterministic item for attribute');
        if (attr.limited) {
          const candidate = completeItems.find(
            (itemAttrVal) =>
              itemAttrVal.attributes[attr.id] === ATTRIBUTE_VALUE_DICT.RELATED.value &&
              !usedItems[itemAttrVal.id],
          );
          if (candidate) {
            selection = candidate;
            usedItems[candidate.id] = true;
          }
        } else {
          const candidate = completeItems.find(
            (itemAttrVal) =>
              itemAttrVal.attributes[attr.id] === ATTRIBUTE_VALUE_DICT.DETERMINISTIC.value &&
              !usedItems[itemAttrVal.id],
          );
          if (candidate) {
            selection = candidate;
            usedItems[candidate.id] = true;
          }
        }
        tries += 1;
      }
      return selection;
    })
    .filter(Boolean) as ItemAttributesValues[];

  // Step 3: Score each itemAttribute based on the positive values it has on each items
  const attributeAggregatedScores = itemAttributes.reduce((acc: Record<string, number>, attr) => {
    acc[attr.id] = 0;
    return acc;
  }, {});
  const uniqueItemsPerAttributePerId: Record<string, ItemAttributesValues> = {};
  uniqueItemsPerAttribute.forEach((itemAttrVal, index) => {
    uniqueItemsPerAttributePerId[itemAttributes[index].id] = itemAttrVal;
    Object.keys(itemAttrVal.attributes).forEach((attrId) => {
      if (itemAttrVal.attributes[attrId] > 0) {
        attributeAggregatedScores[attrId] += itemAttrVal.attributes[attrId];
      }
    });
  });

  // Step 4: Select the top 24 non-limited attributes by score removing any opposite or related attribute
  const nonLimitedAttributes = itemAttributes.filter((attr) => !attr.limited);
  const topNonLimitedAttributes = sortBy(nonLimitedAttributes, (attr) => -attributeAggregatedScores[attr.id])
    .filter((attr, index, arr) => {
      if (!attr.oppositeId && !attr.relatedId) {
        return true;
      }
      // If attribute has oppositeId, or relatedId, keep only the earliest one
      const relativeId = attr.oppositeId ?? attr.relatedId;
      for (let i = 0; i < index; i++) {
        if (arr[i].id === relativeId) {
          return false;
        }
      }

      return true;
    })
    .slice(0, attributesGridSize - 1);

  // Step 5: For limited itemAttributes, select the single best limited attribute to join the final list
  const limitedAttributes = itemAttributes.filter((attr) => attr.limited);
  const topLimitedAttribute = sortBy(limitedAttributes, (attr) => -attributeAggregatedScores[attr.id])[0];

  // Step 6: Return the top 25 attributes, and their representative items
  const selectedAttributes = [...topNonLimitedAttributes, topLimitedAttribute];
  const selectedAttributesIds = selectedAttributes.map((attr) => attr.id);
  const selectedItems = sampleSize(
    selectedAttributes.map((itemAttribute) => {
      return uniqueItemsPerAttributePerId[itemAttribute.id];
    }),
    itemsGridSize,
  );

  return {
    attributes: sortBy(selectedAttributes.map(createAlienAttribute), ['priority']),
    items: selectedItems.map((itemAttributesValuesEntry) =>
      createAlienItem(items[itemAttributesValuesEntry.id], itemAttributesValuesEntry, selectedAttributesIds),
    ),
  };
}

/**
 * Finds the top fitting common attributes shared by the inquired items.
 * @param alienItems - Array of AlienItem objects.
 * @param alienAttributes - Array of AlienAttribute objects.
 * @param inquiredItemIds - Array of inquired item IDs (1 to 5 IDs).
 * @returns The top fitting AlienAttributes or an empty array if no common attributes are found.
 */
function getBestAttributes(
  alienItems: AlienItem[],
  alienAttributes: AlienAttribute[],
  inquiredItemIds: ItemId[],
): AlienAttribute[] {
  // Filter the alien items to include only those with IDs in inquiredItemIds
  const inquiredItems = alienItems.filter((item) => inquiredItemIds.includes(item.id));

  if (inquiredItems.length === 0) {
    return []; // No matching items found
  }

  // Aggregate attribute scores across inquired items
  const attributeScores: Record<string, number> = {};

  inquiredItems.forEach((item) => {
    Object.entries(item.attributes).forEach(([attributeId, value]) => {
      if (!attributeScores[attributeId]) {
        attributeScores[attributeId] = 0;
      }
      attributeScores[attributeId] += value; // Sum the values of the attributes
    });
  });

  // Sort attributes by their cumulative scores in descending order
  const sortedAttributeIds = Object.entries(attributeScores)
    .filter(([, score]) => score > 0) // Filter out non-positive scores
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([attributeId]) => attributeId);

  // Match the top attribute IDs with the AlienAttribute list
  return sortedAttributeIds
    .map((attributeId) => alienAttributes.find((attr) => attr.id === attributeId))
    .filter((attr): attr is AlienAttribute => attr !== undefined);
}

const ATTRIBUTE_VALUE_PRIORITY = ['*', '^', '+', '~', '!'];

/**
 * Generates a signature string for a given AlienItem based on its attributes and their values.
 * @param alienItems - Array of AlienItem objects.
 * @param alienAttributes - Array of AlienAttribute objects.
 * @param itemId - The ID of the item to generate the signature for.
 * @param options - Additional options for generating the signature.
 * @param options.useOnlyKnownAttributes - Flag indicating whether to use only known attributes.
 * @param options.length - The maximum number of attributes to include in the signature.
 * @param options.prioritizedNegatives - An array of negative prefixes to prioritize.
 * @returns The generated signature string for the item or an empty string if the item is not found.
 */
function getAlienItemSignature(
  alienItems: AlienItem[],
  alienAttributes: AlienAttribute[],
  itemId: ItemId,
  options?: {
    useOnlyKnownAttributes?: boolean;
    length?: number;
    prioritizedNegatives?: string[];
  },
): string {
  // Find the item by ID
  const item = alienItems.find((i) => i.id === itemId);
  if (!item) {
    return ''; // Return an empty string if the item is not found
  }

  // Filter attributes based on `useOnlyKnownAttributes`
  const validAttributes = alienAttributes.filter((attr) =>
    options?.useOnlyKnownAttributes ? attr.known : true,
  );

  // Map the valid attributes by their ID for quick lookup
  const attributeMap = new Map(validAttributes.map((attr) => [attr.id, attr]));

  // Create a list of signature entries based on the item attributes
  const signatureEntries: { prefix: string; id: string; priority: number }[] = [];

  for (const [attributeId, value] of Object.entries(item.attributes)) {
    const attribute = attributeMap.get(attributeId);
    if (attribute) {
      // Find the prefix for the value from ATTRIBUTE_VALUE_DICT
      const entry = Object.values(ATTRIBUTE_VALUE_DICT).find((dictEntry) => dictEntry.value === value);

      if (entry) {
        signatureEntries.push({
          prefix: entry.prefix,
          id: attribute.id,
          priority: attribute.priority,
        });
      }
    }
  }

  const sortedEntries = sortBy(signatureEntries, [
    (o) => ATTRIBUTE_VALUE_PRIORITY.indexOf(o.prefix),
    (o) => {
      if (
        o.prefix === ATTRIBUTE_VALUE_DICT.UNRELATED.prefix &&
        options?.prioritizedNegatives?.includes(o.prefix)
      ) {
        return -1;
      }
      return o.priority;
    },
    ['asc', 'asc'],
  ]);

  // Limit the number of attributes if a length is provided
  const limitedEntries = options?.length ? sortedEntries.slice(0, options?.length) : sortedEntries;

  // Generate the final signature string
  return limitedEntries.map((entry) => `${entry.prefix}${entry.id}`).join('');
}

/**
 * Parses a given item signature string and extracts entries with specific prefixes.
 * The function looks for patterns in the signature string that match the format:
 * [prefix][id], where the prefix is one of the characters: ^, *, +, ~, !, and the id
 * is a sequence of alphanumeric characters.
 * @param signature - The item signature string to parse.
 * @returns An array of objects, each containing:
 * - `prefix`: The prefix character.
 * - `id`: The alphanumeric identifier following the prefix.
 * - `variant`: The name of the variant corresponding to the prefix from the `prefixDictionary`.
 * - `spriteId`: An empty string (to be populated later).
 */
function parseItemSignature(signature: string) {
  const entries = signature.match(/[\^*+~!][a-zA-Z0-9]+/g) ?? [];
  return entries.map((entry) => ({
    prefix: entry[0],
    id: entry.slice(1),
    variant: prefixDictionary[entry[0]].name,
    spriteId: '',
  }));
}

/**
 * Retrieves the IDs of deterministic attributes from a list of alien items.
 * @param alienItems - An array of AlienItem objects to be filtered and processed.
 * @returns An array of attribute IDs that have deterministic values.
 */
function getCursesDeterministicAttributesIds(alienItems: AlienItem[]) {
  const curses = alienItems.filter((item) => item.type === 'CURSE');
  const deterministicValues = curses.reduce((acc: Record<string, boolean>, curse) => {
    Object.entries(curse.attributes).forEach(([attrId, value]) => {
      if (value === ATTRIBUTE_VALUE_DICT.DETERMINISTIC.value) {
        acc[attrId] = true;
      }
    });
    return acc;
  }, {});

  return Object.keys(deterministicValues);
}

/**
 * Determines the best AlienItem of type 'ITEM' that does not clash with any 'CURSE' item signatures
 * and excludes items with any offerings.
 * @param alienItems - Array of AlienItem objects.
 * @param alienAttributes - Array of AlienAttribute objects.
 * @returns The best AlienItem or undefined if no suitable item is found.
 */
function getNonClashingItem(
  alienItems: AlienItem[],
  alienAttributes: AlienAttribute[],
  previouslyInquiredItemsIds?: ItemId[],
  recentlyInquiredItemsIds?: ItemId[],
) {
  // Filter items by type and exclude items with offerings
  const items = alienItems.filter((item) => item.type === 'ITEM' && item.offerings.length === 0);
  const blanks = alienItems.filter((item) => item.type === 'BLANK' && item.offerings.length === 0);
  const curses = alienItems.filter((item) => item.type === 'CURSE');

  const prioritizedNegatives = getCursesDeterministicAttributesIds(curses);

  // Generate known attribute signatures for curses
  const curseSignatures = curses.reduce((acc: Record<string, string>, curse) => {
    const signature = getAlienItemSignature(alienItems, alienAttributes, curse.id, {
      useOnlyKnownAttributes: true,
      length: 5,
      prioritizedNegatives,
    });
    acc[curse.id] = signature;
    return acc;
  }, {});

  // Generate know attribute signatures for blanks
  const blankSignatures = blanks.reduce((acc: Record<string, string>, blank) => {
    const signature = getAlienItemSignature(alienItems, alienAttributes, blank.id, {
      useOnlyKnownAttributes: true,
      length: 5,
      prioritizedNegatives,
    });
    acc[blank.id] = signature;
    return acc;
  }, {});

  // Generate known attribute signatures for items
  const itemSignatures = items.reduce((acc: Record<string, string>, item) => {
    const signature = getAlienItemSignature(alienItems, alienAttributes, item.id, {
      useOnlyKnownAttributes: true,
      length: 5,
      prioritizedNegatives,
    });
    acc[item.id] = signature;
    return acc;
  }, {});

  const getCountForMatches = (signature: string, signatures: Record<string, string>) => {
    return Object.values(signatures).filter((sig) => sig === signature).length;
  };

  const itemsRanking = orderBy(
    items.map((item) => {
      const signature = itemSignatures[item.id];
      const result = {
        item,
        signature,
        equivalentCurses: getCountForMatches(signature, curseSignatures),
        equivalentBlanks: getCountForMatches(signature, blankSignatures),
        isRecentlyInquiredItem: recentlyInquiredItemsIds?.includes(item.id) ?? false,
        isPreviouslyInquiredItem: previouslyInquiredItemsIds?.includes(item.id) ?? false,
      };
      return result;
    }),
    ['equivalentCurses', 'equivalentBlanks', 'isRecentlyInquiredItem', 'isPreviouslyInquiredItem'],
    ['asc', 'asc', 'desc', 'desc'],
  );

  return itemsRanking;
}

/**
 * Calculates the initial known attributes for a set of alien items based on their attributes.
 * @param alienItems - An array of alien items, each containing a set of attributes.
 * @param alienAttributes - An array of alien attributes, each with an id.
 * @returns An array containing the ids of the highest, median, and lowest scoring attributes.
 */
const getInitialKnownAttributes = (alienItems: AlienItem[], alienAttributes: AlienAttribute[]) => {
  const scores: Record<string, number> = {};
  alienAttributes.forEach((attr) => {
    scores[attr.id] = 0;
  });

  alienItems.forEach((item) => {
    Object.entries(item.attributes).forEach(([attrId, value]) => {
      if (value > 0) {
        if (scores[attrId]) {
          scores[attrId] = value;
        }
      }
    });
  });

  const sortedScores = orderBy(keys(scores), (attrId) => -scores[attrId]);

  return [
    sortedScores[1],
    sortedScores[Math.ceil(sortedScores.length / 2)],
    sortedScores[sortedScores.length - 1],
  ];
};

/**
 * Generates a list of inquiry suggestions based on missing alien attributes.
 * @param alienItems - An array of AlienItem objects representing the items associated with aliens.
 * @param alienAttributes - An array of AlienAttribute objects representing the attributes of aliens.
 * @param playerKnownAttributesIds - An array of strings representing the IDs of attributes already known to the player.
 * @returns An array of up to 3 shuffled objects, each containing an attribute and the items associated with it,
 *          ordered by the number of items that have the attribute in descending order.
 */
const getInquirySuggestions = (
  alienItems: AlienItem[],
  alienAttributes: AlienAttribute[],
  playerKnownAttributesIds: string[],
) => {
  const missingAttributes = orderBy(
    alienAttributes
      .filter((attr) => !playerKnownAttributesIds.includes(attr.id))
      .map((attr) => {
        const itemsWithAttribute = alienItems
          .filter((item) => item.attributes[attr.id] > 0 && item.offerings.length === 0)
          .slice(0, 5);
        return {
          attribute: attr,
          items: itemsWithAttribute,
        };
      }),
    ['items.length'],
    ['desc'],
  );

  return orderBy(
    shuffle(missingAttributes.slice(0, 5)).slice(0, 3),
    ['items.length', 'attribute.id'],
    ['desc', 'asc'],
  );
};

export const alienAttributesUtils = {
  createAlienItem,
  createAlienAttribute,
  buildAlienGameGrids,
  getBestAttributes,
  getAlienItemSignature,
  getNonClashingItem,
  getInitialKnownAttributes,
  parseItemSignature,
  getInquirySuggestions,
  ATTRIBUTE_VALUE_DICT,
  ATTRIBUTE_VALUE_PRIORITY,
};

export type { AlienItem, AlienAttribute };
