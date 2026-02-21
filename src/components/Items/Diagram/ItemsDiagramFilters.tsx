import { ClusterOutlined, RobotOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleWipe } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep } from 'lodash';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import { sortJsonKeys } from 'utils';
import { stressSyllableDependencyVerifier, syllableDependencyVerifier, verifiers } from './utils';

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

function prepareFileForDownload(
  diagramItems: Dictionary<DailyDiagramItem>,
  rules: Dictionary<DailyDiagramRule>,
) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);

  const now = Date.now();

  Object.values(copy).forEach((item) => {
    const outdatedRules = Object.values(rules).filter((rule) => rule.updatedAt > item.updatedAt);
    const hasRuleBeenUpdated = outdatedRules.map(() => false);

    // Track initial rules to detect actual changes
    const initialRules = [...item.rules];
    let rulesChanged = false;

    // Performing AUTO updates - Re-run ALL auto rules regardless of timestamp
    const allAutoRules = Object.values(rules).filter((rule) => rule.method === 'auto');
    if (allAutoRules.length > 0) {
      console.log(`Performing ${allAutoRules.length} auto updates for ${item.name}`);
      // Remove all auto rules
      const autoRuleIds = allAutoRules.map((rule) => rule.id);
      item.rules = item.rules.filter((ruleId) => !autoRuleIds.includes(ruleId));
      // Rerun all auto rules
      allAutoRules.forEach((rule) => {
        const pass = verifiers[rule.id](item.name);
        if (pass) {
          item.rules.push(rule.id);
        }
        // Mark outdated rule as verified
        const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
        if (ruleIndex !== -1) {
          hasRuleBeenUpdated[ruleIndex] = true;
        }
      });
    }

    // Performing DEPENDENCY updates - Re-run ALL dependency rules regardless of timestamp
    const allDependencyRules = Object.values(rules).filter((rule) => rule.method === 'dependency');
    if (allDependencyRules.length > 0) {
      console.log(`Performing ${allDependencyRules.length} dependency updates for ${item.name}`);

      // Remove all dependency rules
      const dependencyRuleIds = allDependencyRules.map((rule) => rule.id);
      item.rules = item.rules.filter((ruleId) => !dependencyRuleIds.includes(ruleId));

      const isAcronym = item.rules.includes('ddr-51-pt');
      const syllables = item.syllables ?? '';
      const stressSyllable = item.stressedSyllable;
      // Rerun all dependency rules
      allDependencyRules.forEach((rule) => {
        // Try to do a syllable verifier
        if (syllableDependencyVerifier[rule.id] && syllables) {
          const pass = syllableDependencyVerifier[rule.id](item.name, syllables, isAcronym);
          if (pass) {
            item.rules.push(rule.id);
          } else {
            item.rules = item.rules.filter((r) => r !== rule.id);
          }
          const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
          if (ruleIndex !== -1) {
            hasRuleBeenUpdated[ruleIndex] = true;
          }
        }
        // Try to do a stress syllable verifier
        if (stressSyllableDependencyVerifier[rule.id] && syllables && stressSyllable !== undefined) {
          const pass = stressSyllableDependencyVerifier[rule.id](item.name, syllables, stressSyllable);
          if (pass) {
            item.rules.push(rule.id);
          } else {
            item.rules = item.rules.filter((r) => r !== rule.id);
          }
          const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
          if (ruleIndex !== -1) {
            hasRuleBeenUpdated[ruleIndex] = true;
          }
        }
      });
    }

    // Check if rules actually changed
    rulesChanged =
      initialRules.length !== item.rules.length ||
      !initialRules.every((ruleId) => item.rules.includes(ruleId));

    if (rulesChanged) {
      console.log(`Rules changed for ${item.name}, updating timestamp`);
      item.updatedAt = now;
    } else if (hasRuleBeenUpdated.every(Boolean) && hasRuleBeenUpdated.length > 0) {
      console.log(`All outdated rules verified for ${item.name}, but no changes detected`);
    }

    // Sort rules by value
    item.rules.sort();
  });

  return sortJsonKeys(copy);
}
('');
