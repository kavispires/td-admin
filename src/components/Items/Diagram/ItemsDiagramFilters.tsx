import { ClusterOutlined, RobotOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep } from 'lodash';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import { sortJsonKeys } from 'utils';
import { verifiers } from './utils';

export function ItemsDiagramFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<DailyDiagramItem>) {
  const { addParams, queryParams } = useQueryParams();
  const tdrDiagramRulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules');

  return (
    <SiderContent>
      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(entriesToUpdate)}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={() => prepareFileForDownload(data, tdrDiagramRulesQuery.data ?? {})}
          disabled={isDirty}
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

      <Typography.Paragraph className="my-6" type="secondary">
        v2.0.1
      </Typography.Paragraph>
    </SiderContent>
  );
}

function prepareFileForDownload(
  diagramItems: Dictionary<DailyDiagramItem>,
  rules: Dictionary<DailyDiagramRule>,
) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);

  Object.values(copy).forEach((item) => {
    const outdatedRules = Object.values(rules).filter((rule) => rule.updatedAt > item.updatedAt);

    const autoUpdates = outdatedRules.filter((rule) => rule.method === 'auto');
    if (autoUpdates.length > 0) {
      console.log(`Performing ${autoUpdates.length} auto updates for ${item.name}`);

      // Remove all rules to be updated
      item.rules = item.rules.filter((ruleId) => !autoUpdates.map((rule) => rule.id).includes(ruleId));
      // Rerun rules
      autoUpdates.forEach((rule) => {
        const pass = verifiers[rule.id](item.name);
        if (pass) {
          item.rules.push(rule.id);
        }
      });
    }

    const hasNonAutoUpdates = outdatedRules.some((rule) => rule.method !== 'auto');

    if (!hasNonAutoUpdates) {
      console.log('Auto updating');
      item.updatedAt = Date.now();
    }
  });

  return sortJsonKeys(copy);
}
