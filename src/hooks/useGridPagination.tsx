import { TableProps } from 'antd';
import { useMemo } from 'react';

import { useQueryParams } from './useQueryParams';
import { usePrevious } from 'react-use';

/**
 * Options for configuring table pagination.
 */
type UsePaginationOptions<TData> = {
  /**
   * The data array to be paginated.
   */
  data: TData[];
  /**
   * Only necessary if multiple tables are on the same page.
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
  /**
   * An array of available page size options.
   */
  pageSizeOptions?: number[];
  /**
   * The value that triggers the reset of the pagination.
   */
  resetter?: string;
};

export function useGridPagination<TData>({
  prefix = '',
  data,
  defaultCurrent = 1,
  defaultPageSize = 64,
  pageSizeOptions = [16, 32, 64, 128],
  resetter,
}: UsePaginationOptions<TData>): {
  page: TData[];
  pagination: TableProps['pagination'];
} {
  const { queryParams, addParam } = useQueryParams();
  const currentPage = Number(queryParams.get(`${prefix}page`) ?? String(defaultCurrent));
  const pageSize = Number(queryParams.get(`${prefix}pageSize`) ?? String(defaultPageSize));
  const previous = usePrevious(resetter);

  const page = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [currentPage, pageSize, data]);

  const onChange = (page: number) => {
    addParam(`${prefix}page`, page.toString(), String(defaultCurrent));
  };
  const onShowSizeChange = (_: number, size: number) => {
    addParam(`${prefix}pageSize`, size.toString(), String(defaultPageSize));
  };

  if (resetter !== previous) {
    onChange(defaultCurrent);
  }

  return {
    page,
    pagination: {
      current: currentPage,
      pageSize,
      onChange,
      onShowSizeChange,
      defaultCurrent,
      defaultPageSize,
      pageSizeOptions,
      total: data.length,
      hideOnSinglePage: true,
    },
  };
}
