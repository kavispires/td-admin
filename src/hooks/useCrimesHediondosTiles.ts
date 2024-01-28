import { useQuery } from '@tanstack/react-query';
import { LOCALHOST_RESOURCE_URL } from 'utils/constants';

export function useCrimesHediondosTiles() {
  const resultTiles = useQuery<CrimesHediondosCard[]>({
    queryKey: ['dmhk-scene'],
    queryFn: async () => {
      const url = process.env.NODE_ENV === 'development' ? LOCALHOST_RESOURCE_URL : process.env.PUBLIC_URL;
      const res = await fetch(`${url}/resources/crime-tiles.json`);
      const jsonResponse = (await res.json()) as Record<string, CrimesHediondosCard>;
      return Object.values(jsonResponse).map((entry) => ({
        ...entry,
        tags: entry.tags ? entry.tags : [],
      }));
    },
  });

  return {
    isLoading: resultTiles.isLoading,
    isSuccess: resultTiles.isSuccess,
    isError: resultTiles.isError,
    data: [],
  };
}
