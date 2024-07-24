import { Col, Row, Typography } from 'antd';

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
  const colProps = isSimplified
    ? { xs: 24, sm: 12, md: 8, lg: 4, xl: 3 }
    : { xs: 24, sm: 24, md: 12, lg: 6, xl: 4 };

  return (
    <>
      <Typography.Title level={2}>
        Listing - {capitalize(listingType)} items ({listing.length})
      </Typography.Title>

      <PaginationWrapper pagination={pagination} className="full-width">
        <Row gutter={[16, 16]} className="my-4">
          {page.map((item) => (
            <Col key={item.id} {...colProps}>
              <ItemCard item={item} simplified={isSimplified} />
            </Col>
          ))}
        </Row>
      </PaginationWrapper>
    </>
  );
}
