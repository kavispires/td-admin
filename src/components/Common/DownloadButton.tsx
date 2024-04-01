import { Button, ButtonProps } from 'antd';
import { downloadObjectAsFile } from 'utils';

type DownloadButtonProps = {
  data: PlainObject | Function;
  fileName: string;
} & ButtonProps;

/**
 * Button to download a JSON object as a file
 */
export function DownloadButton({ data, fileName, loading, ...props }: DownloadButtonProps) {
  const readyData = typeof data === 'function' ? data() : data;
  return (
    <Button onClick={() => downloadObjectAsFile(readyData, fileName)} loading={loading} {...props}>
      Download JSON
    </Button>
  );
}
