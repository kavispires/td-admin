import { SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Table, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { Link } from 'react-router-dom';
import { dailyColumns } from './DailyColumns';
import { DataDailyCheck } from './DataDailyCheck';
import { type UseLoadDailySetup, useSaveDailySetup } from './hooks';
import { useGetWarnings } from './utils/warnings';

type DataPopulationProps = {
  language: string;
  dataLoad: UseLoadDailySetup;
};

export function DataPopulation({ language, dataLoad }: DataPopulationProps) {
  const queryLanguage = language as Language;
  const { is } = useQueryParams();
  const warnings = useGetWarnings();
  console.log(warnings);

  const { save, isPending } = useSaveDailySetup(queryLanguage ?? 'pt');

  if (is('dataCheck')) {
    return <DataDailyCheck />;
  }

  return (
    <div>
      <Typography.Title level={2}>Data Population</Typography.Title>

      {dataLoad.isLoading && <div>Loading...</div>}

      <Flex justify="space-between" align="center">
        <span>
          <Link to="/game/daily-setup?dataCheck=true">Go to Check</Link>
          <Typography.Title level={4}>Total: {dataLoad.entries.length}</Typography.Title>
        </span>
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
    </div>
  );
}
