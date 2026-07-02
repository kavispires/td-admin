import { mapValues } from 'lodash';

/**
 * Deserializes the data received from Firestore into a dictionary of specified type.
 *
 * @template TData - The type of data to deserialize.
 * @param data - The data to be deserialized.
 * @returns A dictionary of deserialized data.
 */
export const deserializeFirestoreData = <TData, TParsedData = TData>(
  data: Dictionary<string>,
  entryDeserializer?: (e: TData) => TParsedData,
): Dictionary<TParsedData> => {
  return mapValues(data, (val) => {
    const parsed = JSON.parse(val);
    return entryDeserializer ? entryDeserializer(parsed) : parsed;
  });
};

/**
 * Serializes the data in a dictionary to a dictionary of strings.
 *
 * @param data - The dictionary containing the data to be serialized.
 * @returns A new dictionary with the same keys as the input dictionary, but with the values serialized as strings.
 */
export const serializeFirestoreData = <TData, TParsedData = TData>(
  data: Dictionary<TData>,
  entrySerializer?: (e: TData) => TParsedData,
): Dictionary<string> => {
  return mapValues(data, (val) => JSON.stringify(entrySerializer ? entrySerializer(val) : val));
};
