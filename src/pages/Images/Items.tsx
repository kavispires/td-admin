import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemListing } from 'components/Items/ItemListing';
import { ItemListingFilters } from 'components/Items/ItemListingFilters';
import { ItemSearch } from 'components/Items/ItemSearch';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ItemsProvider, useItemsContext } from 'context/ItemsContext';
import { useState } from 'react';

function ItemsPage() {
  const { isLoading, error, hasResponseData } = useItemsContext();
  const [showSearch, setShowSearch] = useState(true);

  return (
    <PageLayout title="Items" subtitle="Listing">
      <Layout hasSider>
        <PageSider>
          <ItemListingFilters showSearch={showSearch} toggleSearch={() => setShowSearch((p) => !p)} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            {showSearch && !isLoading && <ItemSearch />}
            <ItemListing />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export function Items() {
  return (
    <ItemsProvider>
      <ItemsPage />
    </ItemsProvider>
  );
}
