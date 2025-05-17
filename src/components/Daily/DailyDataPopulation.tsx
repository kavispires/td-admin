import { CloudSyncOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Table, Typography } from 'antd';
import { FilterSelect } from 'components/Common';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { dailyColumns } from './DailyColumns';
import { useLoadDailySetup, useSaveDailySetup } from './hooks';
import { useGetWarnings } from './utils/warnings';

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
          value={language}
          onChange={setLanguage}
          options={[DEFAULT_LANGUAGE]}
          placeholder="Select a language"
        />
        <FilterSelect
          label="Minimum Drawings"
          value={drawingsCount}
          onChange={setDrawingsCount}
          options={[2, 3, 4]}
          placeholder="Select a number"
        />
        <FilterSelect
          label="Batch Size"
          value={batchSize}
          onChange={setBatchSize}
          options={[3, 7, 14, 21, 28]}
          placeholder="Select a number"
        />
        <Button
          onClick={() => {
            setRerun(Date.now());
          }}
          icon={<CloudSyncOutlined />}
        />
      </Flex>

      <DataPopulation language={language} batchSize={batchSize} key={rerun} />
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
  useEffect(() => {
    if (!isEmpty(warnings)) {
      console.log(warnings);
    }
  }, [warnings]);

  const { save, isPending } = useSaveDailySetup(queryLanguage ?? 'pt');

  return (
    <DataLoadingWrapper isLoading={dataLoad.isLoading} error={null} hasResponseData={!dataLoad.isLoading}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={4}>Total: {dataLoad.entries.length}</Typography.Title>

        <Button
          onClick={() => save(dataLoad.entries)}
          loading={isPending}
          disabled={(dataLoad.entries ?? []).length === 0}
          type="primary"
          size="large"
          icon={<SaveOutlined />}
        >
          Save
        </Button>
      </Flex>

      {Object.values(warnings).map((warning) => (
        <Alert key={warning} message={warning} type="warning" showIcon banner />
      ))}

      <Table columns={dailyColumns} dataSource={dataLoad.entries ?? []} scroll={{ x: 'max-content' }} />
    </DataLoadingWrapper>
  );
}
