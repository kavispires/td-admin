import { Image, Layout } from 'antd';
import logo from 'assets/images/logo.svg?url';
import { PageLayout } from 'components/Layout';

function Home() {
  return (
    <PageLayout title="TD Admin">
      <Layout.Content className="content-center">
        <Image alt="logo" className="home-logo" preview={false} src={logo} width={512} />
      </Layout.Content>
    </PageLayout>
  );
}

export default Home;
