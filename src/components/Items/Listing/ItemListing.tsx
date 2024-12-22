import { Flex, Typography } from 'antd';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useItemsContext } from 'context/ItemsContext';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize } from 'lodash';
import { ItemCard } from '../ItemCard';

export function ItemListing() {
  const { queryParams } = useQueryParams();
  const listingType = queryParams.get('deck') ?? 'all';
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
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <ItemCard key={item.id} item={item} simplified={isSimplified} />
          ))}
        </Flex>
      </PaginationWrapper>
    </>
  );
}
