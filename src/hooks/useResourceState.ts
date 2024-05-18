import { DUAL_LANGUAGE_RESOURCES } from 'utils/constants';

import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';
import { useQueryParams } from './useQueryParams';

type ResourceState = {
  resourceName: string | null;
  language?: Language | null;
  response: any;
  isLoading: boolean;
  error?: ResponseError | null;
  hasResponseData: boolean;
  enabled: boolean;
};

export function useResourceState(availableResources: AvailableResources): ResourceState {
  const { queryParams } = useQueryParams();
  const { getUrl } = useBaseUrl('tdr');
  const resourceName = queryParams.get('resourceName') ?? '';
  const language = queryParams.get('language');

  const enabled = !!resourceName && availableResources.includes(resourceName);

  const { data, isLoading, error } = useQuery<any, ResponseError>({
    queryKey: ['resource', resourceName, language],
    queryFn: async () => {
      const url =
        language && !DUAL_LANGUAGE_RESOURCES.includes(resourceName)
          ? getUrl(`${resourceName}-${language}.json`)
          : getUrl(`${resourceName}.json`);

      const res = await fetch(url);

      const result = res.body ? await res.json() : {};

      return result;
    },
    enabled,
  });

  return {
    resourceName,
    language: (language as Language) || null,
    response: data,
    isLoading,
    enabled,
    error,
    hasResponseData: Boolean(data),
  };
}
