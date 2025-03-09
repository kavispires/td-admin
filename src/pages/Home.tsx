import { Image, Layout } from 'antd';
import logo from 'assets/images/logo.svg?url';
import { PageLayout } from 'components/Layout';

function Home() {
  return (
    <PageLayout title="TD Admin">
      <Layout.Content className="content-center">
        <Image src={logo} className="home-logo" alt="logo" preview={false} width={512} />
      </Layout.Content>
    </PageLayout>
  );
}

export default Home;
