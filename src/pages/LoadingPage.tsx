import logo from '@assets/images/logo.svg?url';
import { PageLayout } from '@components/Layout';
import { Image, Layout, Spin } from 'antd';

export function LoadingPage() {
  return (
    <PageLayout title="TD Admin">
      <Spin size="large">
        <Layout.Content className="content-center">
          <Image
            alt="logo"
            className="home-logo"
            preview={false}
            src={logo}
            width={512}
          />
          <span>Loading...</span>
        </Layout.Content>
      </Spin>
    </PageLayout>
  );
}
