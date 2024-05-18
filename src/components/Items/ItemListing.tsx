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

  // TODO: when type change, page should reset
  const { page, pagination } = useGridPagination({ data: listing, resetter: listingType });

  return (
    <>
      <Typography.Title level={2}>
        Listing - {capitalize(listingType)} items ({listing.length})
      </Typography.Title>

      <PaginationWrapper pagination={pagination}>
        <Row gutter={[16, 16]} className="my-4">
          {page.map((item) => (
            <Col key={item.id} xs={24} sm={24} md={12} lg={6} xl={4}>
              <ItemCard item={item} />
            </Col>
          ))}
        </Row>
      </PaginationWrapper>
    </>
  );
}
