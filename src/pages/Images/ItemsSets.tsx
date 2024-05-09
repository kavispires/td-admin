import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsSetsTable } from 'components/Items/ItemSetsTable';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useTDResource } from 'hooks/useTDResource';
import { DailyDiscSet } from 'types';

export function ItemsSets() {
  const { isLoading, error, hasResponseData } = useTDResource<DailyDiscSet>('daily-disc-sets');

  return (
    <PageLayout title="Items" subtitle="Listing">
      <Layout hasSider>
        <PageSider>
          <>-</>
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            <ItemsSetsTable />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
