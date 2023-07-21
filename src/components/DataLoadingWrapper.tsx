import { Alert, Empty, Layout, Spin } from 'antd';

type DataLoadingWrapperProps = {
  isLoading: boolean;
  error?: ResponseError;
  hasResponseData: boolean;
  children: any;
};

export function DataLoadingWrapper({ isLoading, error, hasResponseData, children }: DataLoadingWrapperProps) {
  if (isLoading) {
    return <Spin tip="Loading">{children}</Spin>;
  }

  if (error) {
    return (
      <Layout.Content className="content content--error">
        <Alert message="Error" description={error.message} type="error" />
      </Layout.Content>
    );
  }

  if (hasResponseData === false) {
    return (
      <Layout.Content className="content content--empty">
        <Empty />
      </Layout.Content>
    );
  }

  return <>{children}</>;
}
