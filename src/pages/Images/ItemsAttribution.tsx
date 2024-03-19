import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ItemsProvider, useItemsContext } from 'context/ItemsContext';

export function ItemsAttributionPage() {
  const { isLoading, error, hasResponseData } = useItemsContext();

  return (
    <PageLayout title="Items" subtitle="Attribution">
      <Layout hasSider>
        <PageSider>
          <div>Options</div>
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            Content
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export function ItemsAttribution() {
  return (
    <ItemsProvider>
      <ItemsAttributionPage />
    </ItemsProvider>
  );
}
