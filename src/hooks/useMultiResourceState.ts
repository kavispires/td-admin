import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DUAL_LANGUAGE_RESOURCES } from 'utils/resources-list';
import { useBaseUrl } from './useBaseUrl';

type ResourceLoadState = {
  resourceName: string;
  language?: Language | null;
  data: unknown;
  isLoading: boolean;
  error: ResponseError | null;
};

type MultiResourceState = {
  /**
   * Array of selected resource names
   */
  resourceNames: string[];
  /**
   * Language for loading resources
   */
  language: Language | null;
  /**
   * Individual resource states
   */
  resources: ResourceLoadState[];
  /**
   * Combined/merged data from all resources
   */
  mergedData: Array<Record<string, unknown>>;
  /**
   * Whether any resources are loading
   */
  isLoading: boolean;
  /**
   * Whether all resources have loaded successfully
   */
  hasAllData: boolean;
  /**
   * Combined error state
   */
  error: ResponseError | null;
  /**
   * Whether resources are enabled (have valid resource names)
   */
  enabled: boolean;
};

/**
 * Hook to load multiple resources simultaneously and merge their data
 * @param resourceNames - Array of resource names to load (max 3)
 * @param language - Language for loading resources
 * @returns Multi-resource state with loading, error, and merged data
 */
export function useMultiResourceState(
  resourceNames: string[],
  language: Language | null,
): MultiResourceState {
  const { getUrl } = useBaseUrl('resources');

  // Limit to 3 resources and ensure we always have 3 slots
  const resource1 = resourceNames[0] || '';
  const resource2 = resourceNames[1] || '';
  const resource3 = resourceNames[2] || '';

  // Helper to build URL
  const buildUrl = (resourceName: string): string => {
    if (!resourceName) return '';
    const isDualLanguage = (DUAL_LANGUAGE_RESOURCES as readonly string[]).includes(resourceName);
    if (language && !isDualLanguage) {
      return getUrl(`${resourceName}-${language}.json`);
    }
    return getUrl(`${resourceName}.json`);
  };

  // Create queries for each resource slot (always 3 to follow rules of hooks)
  const query1 = useQuery<unknown, ResponseError>({
    queryKey: ['resource', resource1, language],
    queryFn: async () => {
      const url = buildUrl(resource1);
      if (!url) return null;
      const res = await fetch(url);
      return res.body ? await res.json() : {};
    },
    enabled: !!resource1,
  });

  const query2 = useQuery<unknown, ResponseError>({
    queryKey: ['resource', resource2, language],
    queryFn: async () => {
      const url = buildUrl(resource2);
      if (!url) return null;
      const res = await fetch(url);
      return res.body ? await res.json() : {};
    },
    enabled: !!resource2,
  });

  const query3 = useQuery<unknown, ResponseError>({
    queryKey: ['resource', resource3, language],
    queryFn: async () => {
      const url = buildUrl(resource3);
      if (!url) return null;
      const res = await fetch(url);
      return res.body ? await res.json() : {};
    },
    enabled: !!resource3,
  });

  const queries = [query1, query2, query3];
  const activeResourceNames = [resource1, resource2, resource3].filter(Boolean);

  // Aggregate states
  const resources: ResourceLoadState[] = activeResourceNames.map((name, idx) => ({
    resourceName: name,
    language,
    data: queries[idx]?.data,
    isLoading: queries[idx]?.isLoading ?? false,
    error: queries[idx]?.error ?? null,
  }));

  const isLoading = queries.some((q) => q.isLoading && q.fetchStatus !== 'idle');
  const hasAllData =
    activeResourceNames.length > 0 &&
    queries.slice(0, activeResourceNames.length).every((q) => q.data != null);
  const error = queries.find((q) => q.error)?.error ?? null;
  const enabled = activeResourceNames.length > 0;

  // Merge data from all resources
  const mergedData = useMemo(() => {
    if (!hasAllData) return [];

    const allData: Array<Record<string, unknown>> = [];

    resources.forEach((resource) => {
      if (!resource.data) return;

      // Convert data to array format
      let dataArray: Array<Record<string, unknown>> = [];

      if (Array.isArray(resource.data)) {
        dataArray = resource.data;
      } else if (typeof resource.data === 'object') {
        // Convert object to array of values
        dataArray = Object.values(resource.data);
      }

      // Add metadata to each entry to track source
      dataArray.forEach((entry) => {
        allData.push({
          ...entry,
          _source: resource.resourceName, // Add source tracking
        });
      });
    });

    // Sort by id if available
    return allData.sort((a, b) => {
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idA.localeCompare(idB);
    });
  }, [hasAllData, resources]);

  return {
    resourceNames: activeResourceNames,
    language,
    resources,
    mergedData,
    isLoading,
    hasAllData,
    error,
    enabled,
  };
}
