import { Button, type ButtonProps } from 'antd';
import { downloadObjectAsFile } from 'utils';

type DownloadButtonProps = {
  data: PlainObject | Function;
  fileName: string;
} & ButtonProps;

/**
 * Button to download a JSON object as a file
 */
export function DownloadButton({ data, fileName, loading, children, ...props }: DownloadButtonProps) {
  return (
    <Button
      onClick={() => downloadObjectAsFile(typeof data === 'function' ? data() : data, fileName)}
      loading={loading}
      {...props}
    >
      {children ?? 'Download JSON'}
    </Button>
  );
}
