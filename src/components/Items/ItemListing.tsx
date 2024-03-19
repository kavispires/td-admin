import { Col, Pagination, Row, Typography } from 'antd';
import { useItemsPagination } from 'hooks/useItemsPagination';

import { ItemCard } from './ItemCard';
import { capitalize } from 'lodash';

export function ItemListing() {
  const { page, currentPage, onChange, total, pageSize, onPageSizeChange, listingType } =
    useItemsPagination();

  const pagination = (
    <Pagination
      onChange={onChange}
      current={currentPage}
      total={total}
      pageSizeOptions={[16, 32, 64, 128]}
      pageSize={pageSize}
      onShowSizeChange={onPageSizeChange}
      className="fixed-pagination"
    />
  );

  return (
    <>
      <Typography.Title level={2}>
        Listing - {capitalize(listingType)} items ({total})
      </Typography.Title>

      {pagination}

      <Row gutter={[16, 16]} className="my-4">
        {page.map((item) => (
          <Col key={item.id} xs={24} sm={24} md={12} lg={6} xl={4}>
            <ItemCard item={item} />
          </Col>
        ))}
      </Row>

      {pagination}
    </>
  );
}
