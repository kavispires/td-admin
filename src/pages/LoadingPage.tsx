import { Image, Layout, Spin } from 'antd';
import logo from 'assets/images/logo.svg?url';
import { PageLayout } from 'components/Layout';

export function LoadingPage() {
  return (
    <PageLayout title="TD Admin">
      <Spin size="large" tip="Loading">
        <Layout.Content className="content-center">
          <Image alt="logo" className="home-logo" preview={false} src={logo} width={512} />
          <span>Loading...</span>
        </Layout.Content>
      </Spin>
    </PageLayout>
  );
}
