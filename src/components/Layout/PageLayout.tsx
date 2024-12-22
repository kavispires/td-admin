import { Divider, Layout } from 'antd';
import type { ReactNode } from 'react';
import { Header, type HeaderProps } from './Header';

type PageLayoutProps = {
  children: ReactNode;
} & HeaderProps;

export function PageLayout({ children, ...headerProps }: PageLayoutProps) {
  return (
    <Layout className="page-layout">
      <Header {...headerProps} />
      <Divider style={{ margin: 0 }} />

      {children}
    </Layout>
  );
}
