import { Badge, Button, type ButtonProps } from 'antd';
import { downloadObjectAsFile } from 'utils';

type DownloadButtonProps = {
  data: PlainObject | (() => PlainObject);
  fileName: string;
  hasNewData?: boolean;
} & ButtonProps;

/**
 * Button to download a JSON object as a file
 */
export function DownloadButton({
  data,
  fileName,
  loading,
  children,
  hasNewData,
  ...props
}: DownloadButtonProps) {
  return (
    <Button
      onClick={() => downloadObjectAsFile(typeof data === 'function' ? data() : data, fileName)}
      loading={loading}
      {...props}
    >
      {children ?? 'Download JSON'}
      {hasNewData && <Badge status="warning" />}
    </Button>
  );
}
