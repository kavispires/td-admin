import { CopyOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

type CopyToClipboardButtonProps = {
  content: string | (() => string);
} & Omit<ButtonProps, 'content'>;

export function CopyToClipboardButton({
  content,
  shape,
  icon,
  size,
  ...buttonProps
}: CopyToClipboardButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();

  /**
   * Handles copying the content to clipboard, resolving it if it's a function
   */
  const handleCopy = () => {
    const textToCopy = typeof content === 'function' ? (content as () => string)() : content;
    copyToClipboard(textToCopy);
  };

  return (
    <Button
      icon={icon ?? <CopyOutlined />}
      onClick={handleCopy}
      shape={shape ?? 'circle'}
      size={size ?? 'small'}
      {...buttonProps}
    />
  );
}
