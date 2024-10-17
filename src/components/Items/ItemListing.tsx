import { Typography } from 'antd';
import { ItemCard } from './ItemCard';
import { capitalize } from 'lodash';
import { useItemsContext } from 'context/ItemsContext';
import { useGridPagination } from 'hooks/useGridPagination';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useQueryParams } from 'hooks/useQueryParams';

export function ItemListing() {
  const { queryParams } = useQueryParams();
  const listingType = queryParams.get('type') ?? 'all';
  const { listing } = useItemsContext();

  const { page, pagination } = useGridPagination({ data: listing, resetter: listingType });

  const { is } = useQueryParams();
  const isSimplified = is('simplified');

  return (
    <>
      <Typography.Title level={2}>
        Listing - {capitalize(listingType)} items ({listing.length})
      </Typography.Title>

      <PaginationWrapper pagination={pagination} className="full-width">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {page.map((item) => (
            <ItemCard item={item} simplified={isSimplified} />
          ))}
        </div>
      </PaginationWrapper>
    </>
  );
}
