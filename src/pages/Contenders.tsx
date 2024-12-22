import { Layout } from 'antd';
import { ContendersContent } from 'components/Contenders/ContendersContent';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';

import { ContendersFilters } from 'components/Contenders/ContendersFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import type { ContenderCard } from 'types';

export function Contenders() {
  const contendersQuery = useResourceFirebaseData<ContenderCard>({
    tdrResourceName: 'contenders',
    firebaseDataCollectionName: 'contenders',
    serialize: true,
  });

  return (
    <PageLayout title="Contenders" subtitle="Characters, Celebrities, Personalities">
      <Layout hasSider>
        <PageSider>
          <ContendersFilters {...contendersQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={contendersQuery.isLoading}
            error={contendersQuery.error}
            hasResponseData={!isEmpty(contendersQuery.data)}
          >
            <ContendersContent {...contendersQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Contenders;
