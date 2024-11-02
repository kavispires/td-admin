import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { FofocaQuenteContent } from 'components/FofocaQuente/FofocaQuenteContent';
import { FofocaQuenteFilters } from 'components/FofocaQuente/FofocaQuenteFilters';
import { ItemsGroupsContent } from 'components/Items/Groups/ItemsGroupsContent';
import { ItemsGroupsFilters } from 'components/Items/Groups/ItemsGroupsFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import { Item, ItemGroup, TeenageStudent } from 'types';

export function FofocaQuente() {
  const teenageStudentsQuery = useTDResource<TeenageStudent>('teenage-students');

  return (
    <PageLayout title="Fofoca Quente" subtitle="Teenage Student Cards">
      <Layout hasSider>
        <PageSider>
          <FofocaQuenteFilters {...teenageStudentsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={teenageStudentsQuery.isLoading}
            error={teenageStudentsQuery.error}
            hasResponseData={!isEmpty(teenageStudentsQuery.data)}
          >
            <FofocaQuenteContent {...teenageStudentsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default FofocaQuente;
