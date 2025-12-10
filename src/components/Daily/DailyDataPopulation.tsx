import { CloudSyncOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Table, Typography } from 'antd';
import { FilterSelect } from 'components/Common';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { dailyColumns } from './DailyColumns';
import { useLoadDailySetup, useSaveDailySetup } from './hooks';
import { clearWarnings, useGetWarnings } from './utils/warnings';

export const DEFAULT_LANGUAGE: Language = 'pt';

export function DailyDataPopulation() {
  const [language, setLanguage] = useState('');
  const [drawingsCount, setDrawingsCount] = useState(3);
  const [batchSize, setBatchSize] = useState(7);
  const [rerun, setRerun] = useState(Date.now());

  return (
    <div>
      <Typography.Title level={2}>Data Population</Typography.Title>
      <Flex gap={12}>
        <FilterSelect
          label="Language"
          onChange={setLanguage}
          options={[DEFAULT_LANGUAGE]}
          placeholder="Select a language"
          value={language}
        />
        <FilterSelect
          label="Minimum Drawings"
          onChange={setDrawingsCount}
          options={[2, 3, 4]}
          placeholder="Select a number"
          value={drawingsCount}
        />
        <FilterSelect
          label="Batch Size"
          onChange={setBatchSize}
          options={[1, 3, 7, 14, 21, 28]}
          placeholder="Select a number"
          value={batchSize}
        />
        <Button
          icon={<CloudSyncOutlined />}
          onClick={() => {
            clearWarnings();
            setRerun(Date.now());
          }}
        />

        <FirestoreConsoleLink className="ml-2" path="diario/history" />
      </Flex>

      <DataPopulation batchSize={batchSize} key={rerun} language={language} />
    </div>
  );
}

type DataPopulationProps = {
  language: string;
  batchSize: number;
};

function DataPopulation({ language, batchSize }: DataPopulationProps) {
  const queryLanguage = language as Language;
  const dataLoad = useLoadDailySetup(Boolean(queryLanguage), queryLanguage, batchSize);

  const warnings = useGetWarnings();
  const warningsList = useMemo(() => Object.values(warnings), [warnings]);

  useEffect(() => {
    if (!isEmpty(warnings)) {
      console.log(warnings);
    }
  }, [warnings]);

  const { save, isPending } = useSaveDailySetup(queryLanguage ?? 'pt');

  return (
    <DataLoadingWrapper error={null} hasResponseData={!dataLoad.isLoading} isLoading={dataLoad.isLoading}>
      <Flex align="center" justify="space-between">
        <Typography.Title level={4}>Total: {dataLoad.entries.length}</Typography.Title>

        <Button
          disabled={(dataLoad.entries ?? []).length === 0 || warningsList.length > 0}
          icon={<SaveOutlined />}
          loading={isPending}
          onClick={() => save(dataLoad.entries)}
          size="large"
          type="primary"
        >
          Save
        </Button>
      </Flex>

      {warningsList.map((warning) => (
        <Alert banner key={warning} message={warning} showIcon type="warning" />
      ))}

      <Table columns={dailyColumns} dataSource={dataLoad.entries ?? []} scroll={{ x: 'max-content' }} />
    </DataLoadingWrapper>
  );
}
