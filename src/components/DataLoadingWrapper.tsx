import { Alert, Empty, Layout, Spin } from 'antd';

type DataLoadingWrapperProps = {
  loading: boolean;
  error?:
    | {
        message: string;
      }
    | undefined;
  hasResponseData: boolean;
  children: any;
};

export function DataLoadingWrapper({ loading, error, hasResponseData, children }: DataLoadingWrapperProps) {
  if (loading) {
    return <Spin tip="Loading">{children}</Spin>;
  }

  if (error) {
    return (
      <Layout.Content className="content">
        <Alert message="Error" description={error.message} type="error" />
      </Layout.Content>
    );
  }

  if (hasResponseData === false) {
    return (
      <Layout.Content className="content">
        <Empty />
      </Layout.Content>
    );
  }

  return <>{children}</>;
}
