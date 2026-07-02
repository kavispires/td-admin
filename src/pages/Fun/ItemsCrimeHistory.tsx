import { DataLoadingWrapper } from '@components/DataLoadingWrapper';
import { ItemsCrimeHistoryTable } from '@components/Items/ItemsCrimeHistoryTable';
import { PageLayout } from '@components/Layout';
import { PageSider } from '@components/Layout/PageSider';
import { useTDResource } from '@hooks/useTDResource';
import type { ItemData } from '@types';
import { Layout } from 'antd';
import { isEmpty } from 'lodash';

export function ItemsCrimeHistorySets() {
  const itemsTypeaheadQuery = useTDResource<ItemData>('items');

  return (
    <PageLayout
      subtitle="Crime History Random Sets"
      title="Items"
    >
      <Layout hasSider>
        <PageSider>-</PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={itemsTypeaheadQuery.error}
            hasResponseData={!isEmpty(itemsTypeaheadQuery.data)}
            isLoading={itemsTypeaheadQuery.isLoading}
          >
            <ItemsCrimeHistoryTable />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsCrimeHistorySets;
