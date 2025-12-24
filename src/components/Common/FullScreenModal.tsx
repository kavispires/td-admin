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
      extra={<Button icon={<CloseOutlined />} onClick={onClose} shape="circle" type="text" />}
      variant="outlined"
      {...props}
    />
  );
}
