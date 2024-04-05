import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemAttributionClassifierContent } from 'components/Items/ItemAttributionContent';
import { ItemAttributionFilters } from 'components/Items/ItemAttributionFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import {
  ItemsAttributeValuesProvider,
  useItemsAttributeValuesContext,
} from 'context/ItemsAttributeValuesContext';

export function ItemsAttributionPage() {
  const { isLoading, error, hasResponseData } = useItemsAttributeValuesContext();

  return (
    <PageLayout title="Items" subtitle="Attribution">
      <Layout hasSider>
        <PageSider>
          <ItemAttributionFilters />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            <ItemAttributionClassifierContent />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export function ItemsAttribution() {
  return (
    <ItemsAttributeValuesProvider>
      <ItemsAttributionPage />
    </ItemsAttributeValuesProvider>
  );
}
