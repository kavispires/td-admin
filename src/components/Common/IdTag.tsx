import { Tag, type TagProps } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

export function IdTag(props: TagProps) {
  const copyToClipboard = useCopyToClipboardFunction();

  return <Tag onClick={() => copyToClipboard(props.children?.toString() ?? '')} {...props} />;
}
