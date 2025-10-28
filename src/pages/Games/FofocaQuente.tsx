import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { FofocaQuenteContent } from 'components/FofocaQuente/FofocaQuenteContent';
import { FofocaQuenteFilters } from 'components/FofocaQuente/FofocaQuenteFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import type { TeenageStudent } from 'types';

export function FofocaQuente() {
  const teenageStudentsQuery = useTDResource<TeenageStudent>('teenage-students');

  return (
    <PageLayout subtitle="Teenage Student Cards" title="Fofoca Quente">
      <Layout hasSider>
        <PageSider>
          <FofocaQuenteFilters {...teenageStudentsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={teenageStudentsQuery.error}
            hasResponseData={!isEmpty(teenageStudentsQuery.data)}
            isLoading={teenageStudentsQuery.isLoading}
          >
            <FofocaQuenteContent {...teenageStudentsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default FofocaQuente;
