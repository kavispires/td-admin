import { ClusterOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { cloneDeep } from 'lodash';
import { DailyDiagramItem } from 'types';
import { sortJsonKeys } from 'utils';

export function ItemsDiagramFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
}: UseResourceFirebaseDataReturnType<DailyDiagramItem>) {
  const { addParams, queryParams } = useQueryParams();
  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="daily-diagram-items.json"
          disabled={isDirty}
          block
        />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'rule'}
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
        ]}
      />

      <Divider />

      <Button size="small" block onClick={() => addParams({ display: 'simulator' })}>
        Simulator
      </Button>

      <Typography.Paragraph type="secondary" className="my-6">
        v2.0.1
      </Typography.Paragraph>
    </SiderContent>
  );
}

function prepareFileForDownload(diagramItems: Dictionary<DailyDiagramItem>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);
  // Object.values(copy).forEach((item) => {
  //   item.syllables = (item.syllables ?? '').replace(/·/g, SYLLABLE_SEPARATOR);
  // });
  // console.log(copy);

  return sortJsonKeys(copy);
}
