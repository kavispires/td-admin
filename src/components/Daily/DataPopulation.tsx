// Ant Design Resources
import { TableColumnsType, Table, Button, Flex, Space } from 'antd';
// Components

import { UseLoadDailySetup, useSaveDailySetup } from './hooks';

import { DailyEntry } from './utils/types';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { ArteRuimCard } from 'types';

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
      title: 'Arte Ruim',
      dataIndex: 'arte-ruim',
      key: 'arte-ruim',
      render: ({ number, cardId, text, drawings }) => {
        return (
          <Space direction="vertical">
            <Space>
              <span>#{number}</span>
              <span>CardId: {cardId}</span>
              <span>Count: {drawings.length}</span>
            </Space>
            <div>
              "
              {text
                .split('')
                .map((l: string, i: number) => (i < 2 || l === ' ' ? l : '⏹'))
                .join('')}
              "
            </div>
            <Space>
              {drawings.map((d: string) => (
                <CanvasSVG key={d} drawing={d} width={75} height={75} className="canvas" />
              ))}
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Aqui O',
      dataIndex: 'aqui-o',
      key: 'aqui-o',
      render: ({ number, setId, title }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>SetId: {setId}</span>
            <span>Title: {title[language]}</span>
          </Space>
        );
      },
    },
    {
      title: 'Palavreado',
      dataIndex: 'palavreado',
      key: 'palavreado',
      render: ({ number, words, letters, keyword }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>Letters: {letters.length}</span>
            <span>Keyword: {keyword}</span>
            <Space direction="vertical">
              {words.map((word: string, index: number) => (
                <span key={`${number}-${word}`}>
                  {word
                    .split('')
                    .map((l: string, i: number) => (i === index || l === ' ' ? l : '⏹'))
                    .join('')}
                </span>
              ))}
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Artista',
      dataIndex: 'artista',
      key: 'artista',
      render: ({ number, cards }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            {cards.map((card: ArteRuimCard, index: number) => (
              <span key={`${card.id}-${index}`}>{card.text}</span>
            ))}
          </Space>
        );
      },
    },
  ];

  const { save, isPending } = useSaveDailySetup(queryLanguage ?? 'pt');

  return (
    <div>
      {dataLoad.isLoading && <div>Loading...</div>}
      <Flex justify="space-between" align="center">
        <h1>Total: {dataLoad.entries.length}</h1>
        <Button
          onClick={() => save(dataLoad.entries)}
          loading={isPending}
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
