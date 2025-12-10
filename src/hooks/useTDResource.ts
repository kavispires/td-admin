import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useBaseUrl } from './useBaseUrl';

export function useTDResource<TData, TSerializedData = TData>(
  resourceName: string,
  options?: Omit<
    UseQueryOptions<Dictionary<TSerializedData>, Error, Dictionary<TData>>,
    'queryKey' | 'queryFn'
  >,
) {
  const { getUrl } = useBaseUrl('resources');

  const query = useQuery<Dictionary<TSerializedData>, Error, Dictionary<TData>>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as Dictionary<TSerializedData>;
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

export function useTDResourceNonCollection<TData, TSerializedData = TData>(
  resourceName: string,
  options?: Omit<UseQueryOptions<TSerializedData, Error, TData>, 'queryKey' | 'queryFn'>,
) {
  const { getUrl } = useBaseUrl('resources');

  const query = useQuery<TSerializedData, Error, TData>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as TSerializedData;
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
