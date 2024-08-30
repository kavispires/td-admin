import { Button, Space } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

type CopyIdsButtonProps = {
  ids: string[];
};

export function CopyIdsButton({ ids }: CopyIdsButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <Space direction="vertical" size="small">
      <Button size="small" onClick={() => copyToClipboard(JSON.stringify(ids))}>
        Copy Ids
      </Button>
    </Space>
  );
}
