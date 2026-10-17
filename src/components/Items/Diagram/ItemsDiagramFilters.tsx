import { ClusterOutlined, RobotOutlined, TableOutlined } from '@ant-design/icons';
import { FilterSegments } from '@components/Common';
import { DownloadButton } from '@components/Common/DownloadButton';
import { FirestoreConsoleWipe } from '@components/Common/FirestoreConsoleLink';
import { SaveButton } from '@components/Common/SaveButton';
import { SiderContent } from '@components/Layout';
import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import { useTDResource } from '@hooks/useTDResource';
import type { DailyDiagramItemData, DailyDiagramRuleData } from '@types';
import { App, Divider, Flex, Typography } from 'antd';
import { prepareDiagramItemsForDownload } from './prepareDiagramItemsForDownload';

export function ItemsDiagramFilters({
  data,
  save,
  isDirty,
  isSaving,
  isSuccess,
  entriesToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<DailyDiagramItemData>) {
  const { notification } = App.useApp();
  const { addParams, queryParams } = useQueryParams();
  const tdrDiagramRulesQuery = useTDResource<DailyDiagramRuleData>('daily-diagram-rules');

  const prepareDownload = () => {
    try {
      if (isDirty || isSaving || !isSuccess || !tdrDiagramRulesQuery.isSuccess) {
        throw new Error('Diagram items and rules must be loaded and all changes saved before downloading.');
      }
      return prepareDiagramItemsForDownload(data, tdrDiagramRulesQuery.data);
    } catch (error) {
      notification.error({
        title: 'Diagram download failed',
        description: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return (
    <SiderContent>
      <Flex
        gap={12}
        vertical
      >
        <SaveButton
          dirt={JSON.stringify(entriesToUpdate)}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={prepareDownload}
          disabled={isDirty || isSaving || !isSuccess || !tdrDiagramRulesQuery.isSuccess}
          fileName="daily-diagram-items.json"
          hasNewData={hasFirestoreData}
        />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1 })}
        options={[
          {
            title: 'By Rule',
            icon: <ClusterOutlined />,
            value: 'rule',
          },
          {
            title: 'By Thing',
            icon: <TableOutlined />,
            value: 'thing',
          },
          {
            title: 'Simulator',
            icon: <RobotOutlined />,
            value: 'simulator',
          },
        ]}
        value={queryParams.get('display') ?? 'rule'}
      />

      <Divider />

      <Typography.Paragraph
        className="my-6"
        type="secondary"
      >
        v2.1.0
      </Typography.Paragraph>

      <FirestoreConsoleWipe
        disabled={isDirty}
        docId="diagramItems"
        path="tdr"
        queryKey={['tdr', 'diagramItems']}
      />
    </SiderContent>
  );
}
