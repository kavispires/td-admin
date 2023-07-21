import { CopyOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type CopyToClipboardButtonProps = {
  content: string;
};

export function CopyToClipboardButton({ content }: CopyToClipboardButtonProps) {
  return (
    <CopyToClipboard text={content}>
      <Button shape="circle" icon={<CopyOutlined />} size="small" />
    </CopyToClipboard>
  );
}
