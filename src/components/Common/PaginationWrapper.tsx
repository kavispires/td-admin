import { Pagination, Space, type SpaceProps, type TableProps } from 'antd';
import type { ReactNode } from 'react';

type PaginationWrapperProps = {
  children: ReactNode;
  pagination: TableProps['pagination'];
} & SpaceProps;

export function PaginationWrapper({ children, pagination, ...spaceProps }: PaginationWrapperProps) {
  const paginationComponent = <Pagination showQuickJumper {...pagination} className="fixed-pagination" />;
  return (
    <Space orientation="vertical" {...spaceProps}>
      {paginationComponent}
      {children}
      {paginationComponent}
    </Space>
  );
}
