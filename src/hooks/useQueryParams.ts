import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryParams(defaultParams: Record<string, string | number> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const addParam = (key: string, value: unknown) => {
    if (value === undefined || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }

    setSearchParams(searchParams);
  };

  const removeParam = (key: string, value: unknown) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (!searchParams.has(key)) {
        addParam(key, value);
      }
    });
  }, []); // eslint-disable-line

  const queryParams = searchParams
    .toString()
    .split('&')
    .reduce((qp: Record<string, string>, entry) => {
      const [key, value] = entry.split('=');
      if (key && value !== undefined) {
        qp[key] = value;
      }
      return qp;
    }, {});

  return {
    addParam,
    removeParam,
    queryParams,
  };
}
