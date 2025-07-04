import { Flex, Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsDiagramFilters } from 'components/Items/Diagram/ItemsDiagramFilters';
import { ItemsDiagramSetsContent } from 'components/Items/Diagram/ItemsDiagramSetsContent';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { DailyDiagramItem } from 'types';

export function ItemsDiagramSets() {
  const diagramData = useResourceFirestoreData<DailyDiagramItem>({
    tdrResourceName: 'daily-diagram-items',
    firestoreDataCollectionName: 'diagramItems',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Diagram Sets" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemsDiagramFilters {...diagramData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={diagramData.error}
            hasResponseData={!isEmpty(diagramData.data)}
            isLoading={diagramData.isLoading || diagramData.isSaving}
          >
            <Flex gap={24} vertical>
              <ItemsDiagramSetsContent {...diagramData} />
            </Flex>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsDiagramSets;
