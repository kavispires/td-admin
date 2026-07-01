import { CloudSyncOutlined, SaveOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, App, Button, Flex, Table, Typography } from 'antd';
import { FilterSelect } from 'components/Common';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { useState } from 'react';
import { dailyColumns } from './DailyColumns';
import { type DailyEntry, useLoadDailySetup, useSaveDailySetup } from './hooks';

export const DEFAULT_LANGUAGE: Language = 'pt';

export function DailyDataPopulation() {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState('');
  const [drawingsCount, setDrawingsCount] = useState(3);
  const [batchSize, setBatchSize] = useState(7);

  const onRerun = () => {
    queryClient.invalidateQueries({ queryKey: ['generate-daily'] });
  };

  return (
    <div>
      <Typography.Title level={2}>Data Population</Typography.Title>
      <Flex gap={12}>
        <FilterSelect
          label="Language"
          layout="horizontal"
          onChange={setLanguage}
          options={[DEFAULT_LANGUAGE]}
          placeholder="Select a language"
          value={language}
        />
        <FilterSelect
          label="Minimum Drawings"
          layout="horizontal"
          onChange={setDrawingsCount}
          options={[2, 3, 4]}
          placeholder="Select a number"
          value={drawingsCount}
        />
        <FilterSelect
          label="Batch Size"
          layout="horizontal"
          onChange={setBatchSize}
          options={[1, 2, 3, 4, 7, 14, 21, 28]}
          placeholder="Select a number"
          value={batchSize}
        />
        <Button
          icon={<CloudSyncOutlined />}
          onClick={onRerun}
        />

        <FirestoreConsoleLink
          className="ml-2"
          path="diario/history"
        />
      </Flex>

      <DataPopulation
        batchSize={batchSize}
        language={language}
      />
    </div>
  );
}

type DataPopulationProps = {
  language: string;
  batchSize: number;
};

function DataPopulation({ language, batchSize }: DataPopulationProps) {
  const { notification } = App.useApp();
  const queryLanguage = language as Language;
  const dataLoad = useLoadDailySetup(Boolean(queryLanguage), queryLanguage, batchSize);

  const { save, isPending } = useSaveDailySetup(queryLanguage ?? 'pt');

  return (
    <DataLoadingWrapper
      error={null}
      hasResponseData={!dataLoad.isLoading}
      isLoading={!!queryLanguage && dataLoad.isLoading}
    >
      <Flex
        align="center"
        justify="space-between"
      >
        <Typography.Title level={4}>Total: {dataLoad.entries.length}</Typography.Title>

        <Button
          disabled={(dataLoad.entries ?? []).length === 0}
          icon={<SaveOutlined />}
          loading={isPending}
          onClick={() => {
            // biome-ignore lint/suspicious/noConsole: on purpose
            console.log('Saving data...');
            // biome-ignore lint/suspicious/noConsole: on purpose
            console.log('Entries to save:', dataLoad.entries);
            // biome-ignore lint/suspicious/noConsole: on purpose
            console.log('History update:', dataLoad.historyUpdates);

            const undefinedIssues = verifyUndefinedValues(dataLoad.entries ?? []);
            if (undefinedIssues.length > 0) {
              // biome-ignore lint/suspicious/noConsole: on purpose
              console.error('Found undefined values:', undefinedIssues);
              notification.error({
                message: 'Undefined Values Found',
                description: `Found ${undefinedIssues.length} undefined values. Check console for details.`,
              });
              return;
            }

            save(dataLoad);
          }}
          size="large"
          type="primary"
        >
          Save
        </Button>
      </Flex>

      {dataLoad.isMissingEntries && (
        <Alert
          banner
          title={`Warning: ${dataLoad.missingEntries.length} entries are missing or incomplete. Check console for details.`}
          type="warning"
        />
      )}

      {dataLoad.errors.map((error) => (
        <Alert
          banner
          key={error}
          showIcon
          title={error}
          type="error"
        />
      ))}

      <Table
        columns={dailyColumns}
        dataSource={dataLoad.entries ?? []}
        scroll={{ x: 'max-content' }}
      />
    </DataLoadingWrapper>
  );
}

/**
 * Deeply checks for any undefined values in the entries and returns a list of issues found
 */
function verifyUndefinedValues(entries: DailyEntry[]): string[] {
  const issues: string[] = [];

  function checkValue(value: unknown, path: string): void {
    if (value === undefined) {
      issues.push(path);
      return;
    }

    if (value === null || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${path}[${index}]`);
      });
    } else {
      const obj = value as Record<string, unknown>;
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          checkValue(obj[key], `${path}.${key}`);
        }
      }
    }
  }

  entries.forEach((entry, index) => {
    checkValue(entry, `entry[${index}](id: ${entry.id})`);
  });

  return issues;
}
