import { useQuery } from 'react-query';

export function useCrimesHediondosData() {
  const resultWP = useQuery<CrimesHediondosCard[]>(
    'dmhk-wp',
    async () => {
      const res = await fetch(`${process.env.REACT_APP_TDI_URL}/data/dmhk/wp.json`);
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

  const resultEV = useQuery<CrimesHediondosCard[]>(
    'dmhk-ev',
    async () => {
      const res = await fetch(`${process.env.REACT_APP_TDI_URL}/data/dmhk/ev.json`);
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
  // const resultWP = { isLoading: false, isSuccess: true, isError: false, data: [] };

  return {
    isLoading: resultEV.isLoading || resultWP.isLoading,
    isSuccess: resultEV.isSuccess || resultWP.isSuccess,
    isError: resultEV.isError || resultWP.isError,
    data: [...(resultEV.data ?? []), ...(resultWP.data ?? [])],
  };
}
