import { Empty, Pagination, Space, type SpaceProps, type TableProps } from 'antd';
import type { ReactNode } from 'react';

type PaginationWrapperProps = {
  children: ReactNode;
  pagination: TableProps['pagination'];
} & SpaceProps;

export function PaginationWrapper({ children, pagination, ...spaceProps }: PaginationWrapperProps) {
  const paginationComponent = <Pagination showQuickJumper {...pagination} className="fixed-pagination" />;

  return (
    <Space direction="vertical" {...spaceProps}>
      {paginationComponent}
      {children}
      {pagination && pagination.total === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No entries" />
      )}
      {paginationComponent}
    </Space>
  );
}
