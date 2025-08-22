import { ArrowUpOutlined, DeleteOutlined, FireOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Popconfirm, Typography } from 'antd';
import { useFirestoreConsoleUrl } from 'hooks/useBaseUrl';
import { useWipeFirebaseDoc } from 'hooks/useWipeFirebaseDoc';

type FirestoreConsoleLinkProps = {
  path: string;
  label?: string;
  disabled?: boolean;
} & React.ComponentProps<typeof Typography.Link>;

export function FirestoreConsoleLink({ path, label, disabled, ...rest }: FirestoreConsoleLinkProps) {
  const { getConsoleUrl } = useFirestoreConsoleUrl();

  return (
    <Typography.Link disabled={disabled} href={getConsoleUrl(path)} target="_blank" {...rest}>
      <GoogleOutlined /> {label ?? 'Console'} <ArrowUpOutlined style={{ rotate: '45deg' }} />
    </Typography.Link>
  );
}

type FirebaseConsoleWipeProps = {
  /**
   * The path to get to the document
   */
  path: string;
  /**
   * The ID of the document
   */
  docId: string;
  /**
   * The query key to be refresh upon deletion
   */
  queryKey: string[];
  /**
   * The label for the console link (default: Console)
   */
  label?: string;
  /**
   * Whether the link and button are disabled
   */
  disabled?: boolean;
};

export function FirebaseConsoleWipe({
  path,
  docId,
  queryKey,
  label,
  disabled,
  ...rest
}: FirebaseConsoleWipeProps) {
  const { getConsoleUrl } = useFirestoreConsoleUrl();

  const mutationQuery = useWipeFirebaseDoc({
    path,
    docId,
    queryKey,
  });

  return (
    <Flex align="center" gap={8}>
      <Typography.Link disabled={disabled} href={getConsoleUrl(`${path}/${docId}`)} target="_blank" {...rest}>
        <GoogleOutlined /> {label ?? 'Console'} <ArrowUpOutlined style={{ rotate: '45deg' }} />
      </Typography.Link>
      <Divider type="vertical" />
      <Popconfirm
        cancelText="No, don't wipe it"
        description="You should only do this if it has been downloaded to td-resources and deployed"
        icon={<DeleteOutlined />}
        okButtonProps={{ danger: true }}
        okText="Yes, wipe it"
        onConfirm={() => mutationQuery.mutateAsync()}
        placement="topRight"
        title={`Are you sure to wipe the document: ${path}/${docId}?`}
      >
        <Button danger disabled={disabled} loading={mutationQuery.isPending} size="small">
          <FireOutlined />
        </Button>
      </Popconfirm>
    </Flex>
  );
}
