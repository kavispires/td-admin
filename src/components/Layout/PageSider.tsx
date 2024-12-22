import { Layout } from 'antd';
import type { ReactNode } from 'react';

type PageSiderProps = {
  children: ReactNode;
};

export function PageSider({ children }: PageSiderProps) {
  return (
    <Layout.Sider className="sider">
      <div className="sider__content">{children}</div>
    </Layout.Sider>
  );
}
