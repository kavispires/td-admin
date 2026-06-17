import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, type CardProps } from 'antd';
import clsx from 'clsx';

type FullScreenModalProps = {
  open: boolean;
  onClose: () => void;
} & Omit<CardProps, 'extra'>;

export function FullScreenModal({ open, onClose, style, ...props }: FullScreenModalProps) {
  return (
    <Card
      className={clsx('full-screen-modal', !open && 'full-screen-modal--hidden')}
      extra={<Button icon={<CloseOutlined />} onClick={onClose} shape="circle" type="text" />}
      style={{ width: '100vw', height: '100vh', zIndex: 1000, ...style }}
      variant="outlined"
      {...props}
    />
  );
}
