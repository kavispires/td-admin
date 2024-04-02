import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemAttributionCard } from 'components/Items/ItemAttributionCard';
import { ItemAttributionFilters } from 'components/Items/ItemAttributionFilters';
import { ItemAttributionNavigation } from 'components/Items/ItemAttributionNavigation';
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
            <ItemAttributionNavigation />
            <ItemAttributionCard />
            <ItemAttributionNavigation />
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
