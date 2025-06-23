/**
 * TODO: memoize
 */
export const getSuspectImageId = (id: string, version: string) => {
  const splitId = id.split('-');
  return `${splitId[0]}-${version ?? 'gb'}-${splitId[1]}`;
};
