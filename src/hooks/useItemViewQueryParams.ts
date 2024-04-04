import { useSearchParams } from 'react-router-dom';

export function useItemViewQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams);
  searchParams.get('view');

  return {
    view: searchParams.get('view') ?? 'classifier',
    setView: (value: string) => setSearchParams({ view: value }),
  };
}
