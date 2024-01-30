import { CrimeTile } from 'types';

import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';

export function useCrimesHediondosTiles() {
  const { getUrl } = useBaseUrl('tdr');

  const query = useQuery<Dictionary<CrimeTile>, ResponseError>({
    queryKey: ['dmhk-scene'],
    queryFn: async () => {
      const res = await fetch(getUrl('crime-tiles.json'));
      return (await res.json()) as Dictionary<CrimeTile>;
    },
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
