import { Image, Layout } from 'antd';
import logo from 'assets/images/logo.svg';
import { PageLayout } from 'components/Layout';

export function Home() {
  return (
    <PageLayout title="TDR">
      <Layout className="layout-center">
        <Image src={logo} className="home-logo" alt="logo" preview={false} width={512} />
      </Layout>
    </PageLayout>
  );
}
