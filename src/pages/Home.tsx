import { Image, Layout } from 'antd';
import logo from 'assets/images/logo.svg';
import { PageLayout } from 'components/Layout';

function Home() {
  return (
    <PageLayout title="TDR">
      <Layout.Content className="content-center">
        <Image src={logo} className="home-logo" alt="logo" preview={false} width={512} />
      </Layout.Content>
    </PageLayout>
  );
}

export default Home;
