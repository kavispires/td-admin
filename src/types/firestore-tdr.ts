import type { ItemId } from './tdr';

/**
 * Item Atributes Values
 */
export type ItemAttributesValuesFirestore = {
  /**
   * Unique identifier for the item
   */
  id: ItemId;
  /**
   * The alien message using prefixes and attribute keys
   * (^) -10, (!) -3, (~) -1, (+) 5, (*) 10
   */
  tempSignature: string;
  /**
   * The timestamp of the last update
   */
  updatedAt?: number;
};
