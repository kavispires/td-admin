import { Flex, Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsDiagramFilters } from 'components/Items/Diagram/ItemsDiagramFilters';
import { ItemsDiagramSetsContent } from 'components/Items/Diagram/ItemsDiagramSetsContent';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { DailyDiagramItem } from 'types';

export function ItemsDiagramSets() {
  const diagramData = useResourceFirebaseData<DailyDiagramItem>({
    tdrResourceName: 'daily-diagram-items',
    firebaseDataCollectionName: 'diagramItems',
    serialize: true,
  });

  return (
    <PageLayout title="Items" subtitle="Quartet Sets">
      <Layout hasSider>
        <PageSider>
          <ItemsDiagramFilters {...diagramData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={diagramData.isLoading || diagramData.isSaving}
            error={diagramData.error}
            hasResponseData={!isEmpty(diagramData.data)}
          >
            <Flex vertical gap={24}>
              <ItemsDiagramSetsContent {...diagramData} />
            </Flex>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsDiagramSets;
