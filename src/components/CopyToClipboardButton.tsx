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
      icon={icon ?? <CopyOutlined />}
      onClick={() => copyToClipboard(content)}
      shape={shape ?? 'circle'}
      size={size ?? 'small'}
      {...buttonProps}
    />
  );
}
