import { useQuery } from '@tanstack/react-query';
import { CrimeTile } from 'types';
import { getTDIUrl } from 'utils';

export function useTDIData() {
  const query = useQuery<Dictionary<CrimeTile>, ResponseError>({
    queryKey: ['tdi-data'],
    queryFn: async () => {
      const res = await fetch(getTDIUrl('info.json'));
      return (await res.json()) as Dictionary<CrimeTile>;
    },
  });

  return {
    ...query,
    data: query.data ?? {},
  };
}
