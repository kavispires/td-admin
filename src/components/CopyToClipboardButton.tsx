import { CopyOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

type CopyToClipboardButtonProps = {
  content: string;
} & ButtonProps;

export function CopyToClipboardButton({
  content,
  shape,
  icon,
  size,
  ...buttonProps
}: CopyToClipboardButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();

  return (
    <Button
      shape={shape ?? 'circle'}
      icon={icon ?? <CopyOutlined />}
      size={size ?? 'small'}
      onClick={() => copyToClipboard(content)}
      {...buttonProps}
    />
  );
}
