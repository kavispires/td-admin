import { Layout } from 'antd';
import { DailyContent } from 'components/Daily/DailyContent';
import { DailyFilters } from 'components/Daily/DailyFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';

function DailyPage() {
  return (
    <PageLayout title="Daily Setup">
      <Layout hasSider>
        <PageSider>
          <DailyFilters />
        </PageSider>

        <Layout.Content className="content">
          <DailyContent />
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default DailyPage;
