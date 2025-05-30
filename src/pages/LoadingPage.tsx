import { Image, Layout, Spin } from 'antd';
import logo from 'assets/images/logo.svg?url';
import { PageLayout } from 'components/Layout';

export function LoadingPage() {
  return (
    <PageLayout title="TD Admin">
      <Spin tip="Loading" size="large">
        <Layout.Content className="content-center">
          <Image src={logo} className="home-logo" alt="logo" preview={false} width={512} />
          <span>Loading...</span>
        </Layout.Content>
      </Spin>
    </PageLayout>
  );
}
