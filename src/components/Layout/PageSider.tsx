import { useHeaderHeightState } from '@store/headerHeight';
import { Layout } from 'antd';
import type { ReactNode } from 'react';

type PageSiderProps = {
  children: ReactNode;
};

export function PageSider({ children }: PageSiderProps) {
  const { headerHeight } = useHeaderHeightState();

  return (
    <Layout.Sider
      className="sider"
      style={{ minHeight: `calc(100vh - ${headerHeight ?? 128}px)` }}
    >
      <div className="sider__content">{children}</div>
    </Layout.Sider>
  );
}
