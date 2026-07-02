import { useCopyToClipboardFunction } from '@hooks/useCopyToClipboardFunction';
import { Button, Space } from 'antd';

type CopyIdsButtonProps = {
  ids: string[];
};

export function CopyIdsButton({ ids }: CopyIdsButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <Space
      orientation="vertical"
      size="small"
    >
      <Button
        onClick={() => copyToClipboard(JSON.stringify(ids))}
        size="small"
      >
        Copy Ids
      </Button>
    </Space>
  );
}
