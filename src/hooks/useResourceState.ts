import { getTDIUrl } from 'utils';

import { useQuery } from '@tanstack/react-query';

import { useQueryParams } from './useQueryParams';

type ResourceState = {
  resourceName: string | null;
  language?: Language | null;
  response: any;
  isLoading: boolean;
  error?: ResponseError | null;
  hasResponseData: boolean;
};

export function useResourceState(availableResources: AvailableResources): ResourceState {
  const {
    queryParams: { resourceName = '', language = '' },
  } = useQueryParams();

  const { data, isLoading, error } = useQuery<any, ResponseError>({
    queryKey: ['resource', resourceName, language],
    queryFn: async () => {
      const url = language
        ? getTDIUrl(`${resourceName}-${language}.json`)
        : getTDIUrl(`${resourceName}.json`);

      const res = await fetch(url);

      const result = res.body ? await res.json() : {};

      return result;
    },
    enabled: !!resourceName && availableResources.includes(resourceName),
  });

  return {
    resourceName,
    language: (language as Language) || null,
    response: data,
    isLoading,
    error,
    hasResponseData: Boolean(data),
  };
}
