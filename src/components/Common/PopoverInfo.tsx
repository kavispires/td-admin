import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';

type PopoverInfoProps = {
  title: ReactNode;
  icon?: ReactNode;
};

export function PopoverInfo({ title, icon }: PopoverInfoProps) {
  return <Tooltip title={title}>{icon ?? <QuestionCircleOutlined />}</Tooltip>;
}
