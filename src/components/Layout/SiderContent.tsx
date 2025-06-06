import { Divider } from 'antd';
import type { ReactNode } from 'react';

type SiderContentProps = {
  children: ReactNode;
};

export function SiderContent({ children }: SiderContentProps) {
  return (
    <div className="sider-content">
      {children}
      <Divider />
    </div>
  );
}
