import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemAttributionFilters } from 'components/Items/Attributes/ItemAttributionFilters';
import { ItemAttributionPageContent } from 'components/Items/Attributes/ItemAttributionPageContent';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import {
  ItemsAttributeValuesProvider,
  useItemsAttributeValuesContext,
} from 'context/ItemsAttributeValuesContext';

function ItemsAttributionPage() {
  const { isLoading, error, hasResponseData } = useItemsAttributeValuesContext();

  return (
    <PageLayout subtitle="Attribution" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemAttributionFilters />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper error={error} hasResponseData={hasResponseData} isLoading={isLoading}>
            <ItemAttributionPageContent />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

function ItemsAttribution() {
  return (
    <ItemsAttributeValuesProvider>
      <ItemsAttributionPage />
    </ItemsAttributeValuesProvider>
  );
}

export default ItemsAttribution;
