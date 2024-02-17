// Ant Design Resources
import { TableColumnsType, Table, Button, Flex } from 'antd';
// Components

import { UseLoadDailySetup, useSaveDailySetup } from './hooks';

import { DailyEntry } from './types';
import { CanvasSVG } from 'components/Daily/CanvasSVG';

type DataPopulationProps = {
  language: string;
  dataLoad: UseLoadDailySetup;
};

export function DataPopulation({ language, dataLoad }: DataPopulationProps) {
  const queryLanguage = language as Language;

  const columns: TableColumnsType<DailyEntry> = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Num',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'CardId',
      dataIndex: 'cardId',
      key: 'cardId',
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      render: (text) => (
        <div>
          {text
            .split('')
            .map((l: string, i: number) => (i < 2 || l === ' ' ? l : '⏹'))
            .join('')}
        </div>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'drawings',
      key: 'count',
      render: (drawings) => <div>{drawings.length}</div>,
    },
    {
      title: 'Drawings',
      dataIndex: 'drawings',
      key: 'drawings',
      render: (drawings) => (
        <div>
          {drawings.map((d: string) => (
            <CanvasSVG key={d} drawing={d} width={100} height={100} className="canvas" />
          ))}
        </div>
      ),
    },
  ];

  const { save, isLoading: isMutating } = useSaveDailySetup(queryLanguage ?? 'pt');

  return (
    <div>
      {dataLoad.isLoading && <div>Loading...</div>}
      <Flex justify="space-between" align="center">
        <h1>Total: {dataLoad.entries.length}</h1>
        <Button
          onClick={() => save(dataLoad.entries)}
          loading={isMutating}
          disabled={(dataLoad.entries ?? []).length === 0}
          type="primary"
          size="large"
        >
          Save
        </Button>
      </Flex>
      <Table columns={columns} dataSource={dataLoad.entries ?? []} />
    </div>
  );
}
