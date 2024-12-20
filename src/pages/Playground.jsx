/* eslint-disable no-unused-vars */
import { Divider, Layout, Typography } from 'antd';

import { useTitle } from 'react-use';
import { Header } from 'components/Layout/Header';
import { PlaygroundContent } from './PlaygroundContent';

const { Text } = Typography;

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
