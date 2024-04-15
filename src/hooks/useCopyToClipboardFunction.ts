import { App } from 'antd';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';

export function useCopyToClipboardFunction() {
  const [state, copyToClipboard] = useCopyToClipboard();
  const { message } = App.useApp();

  useEffect(() => {
    if (state.value) {
      if (state.value.length > 20) {
        message.info(`Copied to clipboard: ${truncate(state.value, { length: 30, omission: '...' })}`);
      } else {
        message.success('Copied');
      }
    }
  }, [state, message]);

  return copyToClipboard;
}
