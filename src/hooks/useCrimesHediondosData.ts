import { CrimesHediondosCard } from 'types';

import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';

export function useCrimesHediondosData() {
  const { getUrl } = useBaseUrl('resources');

  const resultWP = useQuery<CrimesHediondosCard[], ResponseError>({
    queryKey: ['dmhk-wp'],
    queryFn: async () => {
      const res = await fetch(getUrl('crime-weapons.json'));
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
      const res = await fetch(getUrl('crime-evidence.json'));
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
