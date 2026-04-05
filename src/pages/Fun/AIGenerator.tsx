import { Divider, Layout } from 'antd';
import { Header } from 'components/Layout/Header';
import { useTitle } from 'react-use';
import { AIGeneratorContent } from './AIGeneratorContent';

function AIGenerator() {
  useTitle('AI Generator');

  return (
    <Layout>
      <Header title="AI Generator" />

      <Divider />

      <Layout.Content className="content">
        <AIGeneratorContent />
      </Layout.Content>
    </Layout>
  );
}

export default AIGenerator;
