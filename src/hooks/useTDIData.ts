import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';

export function useTDIData() {
  const { getUrl } = useBaseUrl('tdi-data');
  const query = useQuery<NumberDictionary, ResponseError>({
    queryKey: ['tdi-data'],
    queryFn: async () => {
      const res = await fetch(getUrl('info.json'));
      return (await res.json()) as NumberDictionary;
    },
  });

  return {
    ...query,
    data: query.data ?? {},
  };
}
