import { Divider, Layout } from 'antd';
import { Header, HeaderProps } from './Header';
import { ReactNode } from 'react';

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
