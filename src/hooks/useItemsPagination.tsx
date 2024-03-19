import { useItemsContext } from 'context/ItemsContext';
import { useEffect, useMemo, useState } from 'react';

export function useItemsPagination() {
  const { listing, listingType } = useItemsContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(64);

  const page = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return listing.slice(start, end);
  }, [currentPage, listing, pageSize]);

  const onChange = (page: number) => {
    setCurrentPage(page);
  };

  const onPageSizeChange = (_: number, size: number) => {
    setPageSize(size);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [listingType]);

  return {
    currentPage,
    page,
    total: listing.length,
    onChange,
    pageSize,
    onPageSizeChange,
    listingType,
  };
}
