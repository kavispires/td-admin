import { useQuery } from '@tanstack/react-query';

export function useCrimesHediondosData() {
  const resultWP = useQuery<CrimesHediondosCard[], ResponseError>({
    queryKey: ['dmhk-wp'],
    queryFn: async () => {
      const res = await fetch(`${process.env.REACT_APP_TDI_URL}/data/dmhk/wp.json`);
      const jsonResponse = (await res.json()) as Record<string, CrimesHediondosCard>;
      return Object.values(jsonResponse).map((entry) => ({
        ...entry,
        tags: (entry.tags ? entry.tags : []).filter((tag) => !!tag.trim()),
      }));
    },
  });

  const resultEV = useQuery<CrimesHediondosCard[], ResponseError>({
    queryKey: ['dmhk-ev'],
    queryFn: async () => {
      const res = await fetch(`${process.env.REACT_APP_TDI_URL}/data/dmhk/ev.json`);
      const jsonResponse = (await res.json()) as Record<string, CrimesHediondosCard>;
      return Object.values(jsonResponse).map((entry) => ({
        ...entry,
        tags: (entry.tags ? entry.tags : []).filter((tag) => !!tag.trim()),
      }));
    },
  });
  // const resultWP = { isLoading: false, isSuccess: true, isError: false, data: [] };

  return {
    isLoading: resultEV.isLoading || resultWP.isLoading,
    isSuccess: resultEV.isSuccess || resultWP.isSuccess,
    isError: resultEV.isError || resultWP.isError,
    error: resultEV.error || resultWP.error,
    data: [...(resultEV.data ?? []), ...(resultWP.data ?? [])],
  };
}
