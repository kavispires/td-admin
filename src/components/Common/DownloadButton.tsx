import { Badge, Button, type ButtonProps } from 'antd';
import { useState } from 'react';
import { downloadObjectAsFile } from 'utils';

type DownloadButtonProps = {
  /**
   * Data to download, can be an object, a function that returns an object, or a promise that resolves to an object
   */
  data: PlainObject | (() => PlainObject) | Promise<PlainObject> | (() => Promise<PlainObject>);
  /**
   * Name of the downloaded file
   */
  fileName: string;
  /**
   * Whether there is new data available
   */
  hasNewData?: boolean;
} & ButtonProps;

/**
 * Button to download a JSON object as a file
 */
export function DownloadButton({
  data,
  fileName,
  loading: externalLoading,
  children,
  hasNewData,
  ...props
}: DownloadButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = internalLoading || externalLoading;

  const handleDownload = async () => {
    try {
      setInternalLoading(true);

      // Handle all possible data types
      let downloadData: PlainObject;

      if (typeof data === 'function') {
        const result = data();
        if (result instanceof Promise) {
          downloadData = await result;
        } else {
          downloadData = result;
        }
      } else if (data instanceof Promise) {
        downloadData = await data;
      } else {
        downloadData = data;
      }

      downloadObjectAsFile(downloadData, fileName);
    } catch (error) {
      console.error('Failed to download file:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} loading={loading} {...props}>
      {children ?? 'Download JSON'}
      {hasNewData && <Badge status="warning" />}
    </Button>
  );
}
