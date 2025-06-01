import { ArrowUpOutlined, GoogleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { useFirestoreConsoleUrl } from 'hooks/useBaseUrl';

type FirestoreConsoleLinkProps = {
  path: string;
  label?: string;
  disabled?: boolean;
} & React.ComponentProps<typeof Typography.Link>;

export function FirestoreConsoleLink({ path, label, disabled, ...rest }: FirestoreConsoleLinkProps) {
  const { getConsoleUrl } = useFirestoreConsoleUrl();

  return (
    <Typography.Link href={getConsoleUrl(path)} target="_blank" disabled={disabled} {...rest}>
      <GoogleOutlined /> {label ?? 'Console'} <ArrowUpOutlined style={{ rotate: '45deg' }} />
    </Typography.Link>
  );
}
