import { Layout, Space } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemListing } from 'components/Items/ItemListing';
import { ItemListingFilters } from 'components/Items/ItemListingFilters';
import { ItemRandomizer } from 'components/Items/ItemRandomizer';
import { ItemSearch } from 'components/Items/ItemSearch';
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
              <Space size="large">
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
