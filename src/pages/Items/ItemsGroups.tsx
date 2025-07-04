import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsGroupsFilters } from 'components/Items/Groups/ItemsGroupsFilters';
import { ItemsGroupsSubPages } from 'components/Items/Groups/ItemsGroupsSubPages';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import type { Item, ItemGroup } from 'types';

export function ItemsGroups() {
  const groupsQuery = useResourceFirestoreData<ItemGroup>({
    tdrResourceName: 'items-groups',
    firestoreDataCollectionName: 'itemsGroups',
    serialize: true,
  });
  const itemsTypeaheadQuery = useTDResource<Item>('items');

  return (
    <PageLayout subtitle="Groups Sets" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemsGroupsFilters {...groupsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={groupsQuery.error || itemsTypeaheadQuery.error}
            hasResponseData={!isEmpty(groupsQuery.data) && !isEmpty(itemsTypeaheadQuery.data)}
            isLoading={groupsQuery.isLoading || itemsTypeaheadQuery.isLoading}
          >
            <ItemsGroupsSubPages {...groupsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsGroups;
