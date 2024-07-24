import { Pagination, Space, SpaceProps, TableProps } from 'antd';
import { ReactNode } from 'react';

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
      {paginationComponent}
    </Space>
  );
}
