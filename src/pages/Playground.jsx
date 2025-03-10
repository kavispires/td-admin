import { Divider, Layout } from 'antd';
import { Header } from 'components/Layout/Header';
import { useTitle } from 'react-use';
import { PlaygroundContent } from './PlaygroundContent';

function Playground() {
  useTitle('Playground');

  return (
    <Layout>
      <Header title="Playground" />

      <Divider />

      <Layout.Content className="content">
        <PlaygroundContent />
      </Layout.Content>
    </Layout>
  );
}

export default Playground;
