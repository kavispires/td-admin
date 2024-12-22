import { Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

type StatProps = {
  label: ReactNode;
  children: ReactNode;
};

export function Stat({ label, children }: StatProps) {
  return (
    <Typography.Text>
      {label} <Tag>{children}</Tag>
    </Typography.Text>
  );
}
