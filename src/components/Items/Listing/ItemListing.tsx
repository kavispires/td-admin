import { Flex, Typography } from 'antd';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useItemsContext } from 'context/ItemsContext';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize } from 'lodash';
import { ItemCard } from './ItemCard';

export function ItemListing() {
  const { queryParams } = useQueryParams();
  const listingType = queryParams.get('deck') ?? 'all';
  const { listing } = useItemsContext();

  const { page, pagination } = useGridPagination({ data: listing, resetter: listingType });

  return (
    <>
      <Flex align="center" gap={12}>
        <Typography.Title className="my-0" level={2}>
          Listing - {capitalize(listingType)} items ({listing.length})
        </Typography.Title>
        <FirestoreConsoleLink path="/tdr/items" />
      </Flex>

      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </Flex>
      </PaginationWrapper>
    </>
  );
}
