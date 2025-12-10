import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useBaseUrl } from './useBaseUrl';

export function useTDResource<TData>(
  resourceName: string,
  options?: Omit<UseQueryOptions<Dictionary<TData>, Error>, 'queryKey' | 'queryFn'>,
) {
  const { getUrl } = useBaseUrl('resources');

  const query = useQuery<Dictionary<TData>, Error>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as Dictionary<TData>;
    },
    ...options,
  });
  const hasResponseData = !isEmpty(query.data);

  return {
    ...query,
    data: query.data ?? ({} as Dictionary<TData>),
    hasResponseData,
  };
}

export function useTDResourceNonCollection<TData>(
  resourceName: string,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  const { getUrl } = useBaseUrl('resources');

  const query = useQuery<TData, Error>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as TData;
    },
    ...options,
  });
  const hasResponseData = !isEmpty(query.data);

  return {
    ...query,
    data: query.data,
    hasResponseData,
  };
}
