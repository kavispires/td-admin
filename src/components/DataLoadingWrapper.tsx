import { Alert, Empty, Layout, Spin } from 'antd';

type DataLoadingWrapperProps = {
  isIdle?: boolean;
  isLoading: boolean;
  error?: ResponseError;
  hasResponseData: boolean;
  children: any;
};

export function DataLoadingWrapper({
  isLoading,
  isIdle,
  error,
  hasResponseData,
  children,
}: DataLoadingWrapperProps) {
  if (!isIdle && isLoading) {
    return <Spin tip="Loading">{children}</Spin>;
  }

  if (error) {
    return (
      <Layout.Content className="content content-center">
        <Alert message="Error" description={error.message} type="error" showIcon />
      </Layout.Content>
    );
  }

  if (isIdle || hasResponseData === false) {
    return (
      <Layout.Content className="content content-center">
        <Empty />
      </Layout.Content>
    );
  }

  return <>{children}</>;
}
