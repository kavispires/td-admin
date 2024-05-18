import { useMemo } from 'react';
import { useQueryParams } from './useQueryParams';

/**
 * Options for the `usePaginatedPage` hook.
 */
type UsePaginatedPageOptions<TData> = {
  /**
   * The data array to be paginated.
   */
  data: TData[];
  /**
   * An optional prefix for the paginated page.
   */
  prefix?: string;
  /**
   * The default current page number.
   */
  defaultCurrent?: number;
  /**
   * The default number of items per page.
   */
  defaultPageSize?: number;
};

export function usePaginatedPage<TData = unknown>({
  data,
  prefix = '',
  defaultCurrent = 1,
  defaultPageSize = 10,
}: UsePaginatedPageOptions<TData>) {
  const { queryParams } = useQueryParams();
  const currentPage = Number(queryParams.get(`${prefix}page`) ?? String(defaultCurrent));
  const pageSize = Number(queryParams.get(`${prefix}pageSize`) ?? String(defaultPageSize));

  const page = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [currentPage, pageSize, data]);

  return page;
}
