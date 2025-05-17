import { Layout } from 'antd';
import { CrimesHediondosContent } from 'components/CrimesHediondos/CrimesHediondosContent';
import { CrimesHediondosFilters } from 'components/CrimesHediondos/CrimesHediondosFilters';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout, PageSider } from 'components/Layout';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import type { CrimeSceneTile, CrimesHediondosCard, Item } from 'types';

function CrimesHediondos() {
  const weaponsQuery = useResourceFirestoreData<CrimesHediondosCard>({
    tdrResourceName: 'crime-weapons',
    firestoreDataCollectionName: 'crimeWeapons',
    serialize: true,
  });

  const evidenceQuery = useResourceFirestoreData<CrimesHediondosCard>({
    tdrResourceName: 'crime-evidence',
    firestoreDataCollectionName: 'crimeEvidence',
    serialize: true,
  });

  const locationsQuery = useResourceFirestoreData<CrimesHediondosCard>({
    tdrResourceName: 'crime-locations',
    firestoreDataCollectionName: 'crimeLocations',
    serialize: true,
  });

  const victimsQuery = useResourceFirestoreData<CrimesHediondosCard>({
    tdrResourceName: 'crime-victims',
    firestoreDataCollectionName: 'crimeVictims',
    serialize: true,
  });

  const scenesQuery = useResourceFirestoreData<CrimeSceneTile>({
    tdrResourceName: 'crime-scenes',
    firestoreDataCollectionName: 'crimeScenes',
    serialize: true,
  });

  const itemsTypeaheadQuery = useTDResource<Item>('items');

  useEffect(() => {
    const slimScenes = Object.values(scenesQuery.data).map((scene) => {
      return {
        id: scene.id,
        title: scene.title.en,
        description: scene.description.en,
        values: scene.values.map((value) => value.en),
      };
    });
    if (!isEmpty(slimScenes)) {
      console.log('Slim Scenes for GPT:', slimScenes);
    }
  }, [scenesQuery.data]);

  // useEffect(() => {
  //   const list = Object.values(victimsQuery.data)
  //     .map((entry) => {
  //       return !isEmpty(entry.likelihood) ? '' : `"${entry.name.en}"`;
  //     })
  //     .filter(Boolean);

  //   if (!isEmpty(list)) {
  //     console.log('List of items for GPT:\n', list.join('\n'));
  //   }
  // }, [victimsQuery.data]);

  return (
    <PageLayout title="Crimes Hediondos" subtitle="Categorizer">
      <Layout hasSider>
        <PageSider>
          <CrimesHediondosFilters
            weaponsQuery={weaponsQuery}
            evidenceQuery={evidenceQuery}
            scenesQuery={scenesQuery}
            locationsQuery={locationsQuery}
            victimsQuery={victimsQuery}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={
              weaponsQuery.isLoading ||
              evidenceQuery.isLoading ||
              scenesQuery.isLoading ||
              locationsQuery.isLoading ||
              victimsQuery.isLoading ||
              itemsTypeaheadQuery.isLoading
            }
            error={
              weaponsQuery.error ||
              evidenceQuery.error ||
              scenesQuery.error ||
              itemsTypeaheadQuery.error ||
              locationsQuery.error ||
              victimsQuery.error
            }
            hasResponseData={
              !isEmpty(weaponsQuery.data) &&
              !isEmpty(evidenceQuery.data) &&
              !isEmpty(scenesQuery.data) &&
              !isEmpty(locationsQuery.data) &&
              !isEmpty(victimsQuery.data) &&
              !isEmpty(itemsTypeaheadQuery.data)
            }
          >
            <CrimesHediondosContent
              weaponsQuery={weaponsQuery}
              evidenceQuery={evidenceQuery}
              scenesQuery={scenesQuery}
              locationsQuery={locationsQuery}
              victimsQuery={victimsQuery}
            />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default CrimesHediondos;
