import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, type CardProps } from 'antd';
import clsx from 'clsx';

type FullScreenModalProps = {
  open: boolean;
  onClose: () => void;
} & Omit<CardProps, 'extra'>;

export function FullScreenModal({ open, onClose, ...props }: FullScreenModalProps) {
  return (
    <Card
      className={clsx('full-screen-modal', !open && 'full-screen-modal--hidden')}
      bordered={false}
      extra={<Button onClick={onClose} type="text" shape="circle" icon={<CloseOutlined />} />}
      {...props}
    />
  );
}
