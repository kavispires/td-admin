import { Tag, type TagProps } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

export function IdTag(props: TagProps & { withQuotes?: boolean }) {
  const copyToClipboard = useCopyToClipboardFunction();
  const value = props.withQuotes
    ? `"${props.children?.toString() ?? ''}"`
    : (props.children?.toString() ?? '');

  return <Tag onClick={() => copyToClipboard(value)} {...props} />;
}
