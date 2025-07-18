import { Layout } from 'antd';
import { ContendersContent } from 'components/Contenders/ContendersContent';
import { ContendersFilters } from 'components/Contenders/ContendersFilters';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { ContenderCard } from 'types';

export function Contenders() {
  const contendersQuery = useResourceFirestoreData<ContenderCard>({
    tdrResourceName: 'contenders',
    firestoreDataCollectionName: 'contenders',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Characters, Celebrities, Personalities" title="Contenders">
      <Layout hasSider>
        <PageSider>
          <ContendersFilters {...contendersQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={contendersQuery.error}
            hasResponseData={!isEmpty(contendersQuery.data)}
            isLoading={contendersQuery.isLoading}
          >
            <ContendersContent {...contendersQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Contenders;
