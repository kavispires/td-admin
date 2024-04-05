import { useSearchParams } from 'react-router-dom';

export function useItemQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const addQueryParam = (key: string, value: string) => {
    searchParams.set(key, `${value}`);
    setSearchParams(searchParams);
  };

  return {
    view: searchParams.get('view') ?? 'classifier',
    setView: (value: string) => setSearchParams({ view: value }),
    addQueryParam,
    searchParams,
  };
}
