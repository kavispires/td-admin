import { ClusterOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
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
}: UseResourceFirebaseDataReturnType<DailyDiagramItem>) {
  const { addParams, queryParams } = useQueryParams();
  const tdrDiagramRulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules');

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
          data={() => prepareFileForDownload(data, tdrDiagramRulesQuery.data ?? {})}
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

    item.rules = item.rules.sort();

    const hasNonAutoUpdates = outdatedRules.some((rule) => rule.method !== 'auto');

    if (!hasNonAutoUpdates) {
      console.log('Auto updating');
      item.updatedAt = Date.now();
    }
  });

  return sortJsonKeys(copy);
}
