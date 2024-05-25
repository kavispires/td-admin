import { Pagination, Space, TableProps } from 'antd';
import { ReactNode } from 'react';

type PaginationWrapperProps = {
  children: ReactNode;
  pagination: TableProps['pagination'];
};

export function PaginationWrapper({ children, pagination }: PaginationWrapperProps) {
  const paginationComponent = <Pagination showQuickJumper {...pagination} className="fixed-pagination" />;
  return (
    <Space direction="vertical">
      {paginationComponent}
      {children}
      {paginationComponent}
    </Space>
  );
}
