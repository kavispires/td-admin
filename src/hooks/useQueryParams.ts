import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

export function useQueryParams(defaultParams: Record<string, string | number> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const addParam = useCallback(
    (key: string, value: unknown, defaultValue?: unknown) => {
      if (value === undefined || value === '' || value === defaultValue) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, String(value));
      }

      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const addParams = useCallback(
    (params: Record<string, unknown>, defaultValues: Record<string, unknown> = {}) => {
      Object.entries(params).forEach(([key, value]) => {
        if (defaultValues[key] === value) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, String(value));
        }
      });
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const removeParam = useCallback(
    (key: string) => {
      searchParams.delete(key);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const is = useCallback(
    (key: string, value = 'true') => searchParams.get(key) === String(value),
    [searchParams],
  );

  useEffectOnce(() => {
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (!searchParams.has(key)) {
        addParam(key, value);
      }
    });
  });

  return {
    addParam,
    addParams,
    removeParam,
    queryParams: searchParams,
    is,
  };
}
