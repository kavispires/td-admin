import { Button, ButtonProps } from 'antd';
import { downloadObjectAsFile } from 'utils';

type DownloadButtonProps = {
  data: PlainObject;
  fileName: string;
} & ButtonProps;

/**
 * Button to download a JSON object as a file
 */
export function DownloadButton({ data, fileName, loading, ...props }: DownloadButtonProps) {
  return (
    <Button onClick={() => downloadObjectAsFile(data, fileName)} loading={loading} {...props}>
      Download JSON
    </Button>
  );
}
