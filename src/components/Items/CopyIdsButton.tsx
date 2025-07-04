import { Button, Space } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

type CopyIdsButtonProps = {
  ids: string[];
};

export function CopyIdsButton({ ids }: CopyIdsButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <Space direction="vertical" size="small">
      <Button onClick={() => copyToClipboard(JSON.stringify(ids))} size="small">
        Copy Ids
      </Button>
    </Space>
  );
}
