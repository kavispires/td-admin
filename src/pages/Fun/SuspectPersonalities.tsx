import { Divider, Layout } from 'antd';
import { Header } from 'components/Layout/Header';
import { useTitle } from 'react-use';
import { PlaygroundContent } from './PlaygroundContent';

function SuspectPersonalities() {
  useTitle('Suspect Personalities');

  return (
    <Layout>
      <Header title="Suspect Personalities" />

      <Divider />

      <Layout.Content className="content">
        <PlaygroundContent />
      </Layout.Content>
    </Layout>
  );
}

export default SuspectPersonalities;
