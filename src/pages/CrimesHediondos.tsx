import { Layout } from 'antd';
import { CrimesHediondosContent } from 'components/CrimesHediondos/CrimesHediondosContent';
import { CrimesHediondosFilters } from 'components/CrimesHediondos/CrimesHediondosFilters';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout, PageSider } from 'components/Layout';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import { CrimesHediondosCard, Item } from 'types';

function CrimesHediondos() {
  const weaponsQuery = useResourceFirebaseData<CrimesHediondosCard>({
    tdrResourceName: 'crime-weapons',
    firebaseDataCollectionName: 'crimeWeapons',
    serialize: true,
  });

  const evidenceQuery = useResourceFirebaseData<CrimesHediondosCard>({
    tdrResourceName: 'crime-evidence',
    firebaseDataCollectionName: 'crimeEvidence',
    serialize: true,
  });

  const itemsTypeaheadQuery = useTDResource<Item>('items');

  return (
    <PageLayout title="Crimes Hediondos" subtitle="Categorizer">
      <Layout hasSider>
        <PageSider>
          <CrimesHediondosFilters weaponsQuery={weaponsQuery} evidenceQuery={evidenceQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={weaponsQuery.isLoading || evidenceQuery.isLoading || itemsTypeaheadQuery.isLoading}
            error={weaponsQuery.error || evidenceQuery.error || itemsTypeaheadQuery.error}
            hasResponseData={
              !isEmpty(weaponsQuery.data) &&
              !isEmpty(evidenceQuery.data) &&
              !isEmpty(itemsTypeaheadQuery.data)
            }
          >
            <CrimesHediondosContent weaponsQuery={weaponsQuery} evidenceQuery={evidenceQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default CrimesHediondos;
