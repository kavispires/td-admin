import { App, Button, ButtonProps } from 'antd';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';

import { CopyOutlined } from '@ant-design/icons';

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
  const [state, copyToClipboard] = useCopyToClipboard();
  const { message } = App.useApp();

  useEffect(() => {
    if (state.value) {
      if (state.value.length > 20)
        message.info(`Copied to clipboard: ${truncate(state.value, { length: 30, omission: '...' })}`);
    }
  }, [state, message]);

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
