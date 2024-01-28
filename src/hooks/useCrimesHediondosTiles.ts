import { useQuery } from '@tanstack/react-query';
import { CrimeTile } from 'types';
import { getTDRUrl } from 'utils';

export function useCrimesHediondosTiles() {
  const query = useQuery<Dictionary<CrimeTile>, ResponseError>({
    queryKey: ['dmhk-scene'],
    queryFn: async () => {
      const res = await fetch(getTDRUrl('crime-tiles.json'));
      return (await res.json()) as Dictionary<CrimeTile>;
    },
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
