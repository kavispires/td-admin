import { useQuery } from 'react-query';
import { LOCALHOST_RESOURCE_URL } from 'utils/constants';

export function useCrimesHediondosTiles() {
  const resultTiles = useQuery<CrimesHediondosCard[]>(
    'dmhk-wp',
    async () => {
      const url = process.env.NODE_ENV === 'development' ? LOCALHOST_RESOURCE_URL : process.env.PUBLIC_URL;
      const res = await fetch(`${url}/resources/crime-tiles.json`);
      const jsonResponse = (await res.json()) as Record<string, CrimesHediondosCard>;
      return Object.values(jsonResponse).map((entry) => ({
        ...entry,
        tags: entry.tags ? entry.tags : [],
      }));
    },
    {
      retry: 0,
    }
  );

  return {
    isLoading: resultTiles.isLoading,
    isSuccess: resultTiles.isSuccess,
    isError: resultTiles.isError,
    data: [],
  };
}
