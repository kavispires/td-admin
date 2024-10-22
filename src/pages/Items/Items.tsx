import { Layout, Space } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemListing } from 'components/Items/Listing/ItemListing';
import { ItemListingFilters } from 'components/Items/Listing/ItemListingFilters';
import { ItemRandomizer } from 'components/Items/Listing/ItemRandomizer';
import { ItemSearch } from 'components/Items/Listing/ItemSearch';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ItemsProvider, useItemsContext } from 'context/ItemsContext';
import { useQueryParams } from 'hooks/useQueryParams';

function ItemsPage() {
  const { isLoading, error, hasResponseData } = useItemsContext();
  const { is } = useQueryParams();

  return (
    <PageLayout title="Items" subtitle="Listing">
      <Layout hasSider>
        <PageSider>
          <ItemListingFilters />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            {!isLoading && (
              <Space size="large" align="start">
                {!is('hideSearch') && <ItemSearch />}
                {is('showRandomizer') && <ItemRandomizer />}
              </Space>
            )}
            <ItemListing />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

function Items() {
  return (
    <ItemsProvider>
      <ItemsPage />
    </ItemsProvider>
  );
}

export default Items;
