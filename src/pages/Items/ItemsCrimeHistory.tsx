import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsCrimeHistoryTable } from 'components/Items/ItemsCrimeHistoryTable';

import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';

import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import type { Item } from 'types';

export function ItemsCrimeHistorySets() {
  const itemsTypeaheadQuery = useTDResource<Item>('items');

  return (
    <PageLayout title="Items" subtitle="CrimeHistory Sets">
      <Layout hasSider>
        <PageSider>-</PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={itemsTypeaheadQuery.isLoading}
            error={itemsTypeaheadQuery.error}
            hasResponseData={!isEmpty(itemsTypeaheadQuery.data)}
          >
            <ItemsCrimeHistoryTable />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsCrimeHistorySets;
