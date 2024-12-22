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
    <PageLayout title="Items" subtitle="Attribution">
      <Layout hasSider>
        <PageSider>
          <ItemAttributionFilters />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
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
