import { isEmpty } from 'lodash';

import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';

export function useTDResource<TData>(resourceName: string) {
  const { getUrl } = useBaseUrl('tdr');

  const query = useQuery<Dictionary<TData>, ResponseError>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as Dictionary<TData>;
    },
  });
  const hasResponseData = !isEmpty(query.data);

  return {
    ...query,
    data: query.data ?? {},
    hasResponseData,
  };
}
