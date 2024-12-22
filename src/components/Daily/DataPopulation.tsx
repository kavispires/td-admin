import { Alert, Button, Flex, Space, Table, type TableColumnsType } from 'antd';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { AlienSign, Item } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import type { ArteRuimCard } from 'types';

import { type UseLoadDailySetup, useSaveDailySetup } from './hooks';
import type { DailyComunicacaoAlienigenaEntry, DailyEntry } from './utils/types';

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
            <Space wrap>
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
      render: ({ number, setId, title, itemsIds }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>SetId: {setId}</span>
            <span>Title: {title[language]}</span>
            <Flex gap={6} wrap>
              <Item id={itemsIds[1]} width={50} />
              <Item id={itemsIds[5]} width={50} />
              <Item id={itemsIds[10]} width={50} />
            </Flex>
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
      title: 'Filmaço',
      dataIndex: 'filmaco',
      key: 'filmaco',
      render: ({ number, setId, year, title }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>SetId: {setId}</span>
            <span>Year: {year}</span>
            <span>
              Title:{' '}
              {title
                .split('')
                .map((l: string, i: number) => (i < 1 || l === ' ' ? l : '⏹'))
                .join('')}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Controle de Estoque',
      dataIndex: 'controle-de-estoque',
      key: 'controle-de-estoque',
      render: ({ number, title, goods }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>Title: {title}</span>
            <Flex gap={6} wrap>
              <WarehouseGood id={goods[0]} width={50} />
              <WarehouseGood id={goods[1]} width={50} />
              <WarehouseGood id={goods[2]} width={50} />
            </Flex>
          </Space>
        );
      },
    },
    {
      title: 'Teoria de Conjuntos',
      dataIndex: 'teoria-de-conjuntos',
      key: 'teoria-de-conjuntos',
      render: ({ number, title, intersectingThing }) => {
        return (
          <Space direction="vertical">
            <span>#{number}</span>
            <span>Title: {title}</span>
            <Flex gap={6} wrap>
              <Item id={intersectingThing.id} width={50} />
            </Flex>
          </Space>
        );
      },
    },
    {
      title: 'Comunicação Alienígena',
      dataIndex: 'comunicacao-alienigena',
      key: 'comunicacao-alienigena',
      render: (entry: DailyComunicacaoAlienigenaEntry) => {
        if (!entry) {
          return <Alert message="No entry" type="error" />;
        }

        return (
          <Space direction="vertical">
            <span>#{entry.number}</span>
            <span>{entry.itemsIds.length} items</span>
            <Space>
              <Space direction="vertical">
                {entry.attributes.map((req) => (
                  <AlienSign key={req.spriteId} id={`sign-${req.spriteId}`} width={50} />
                ))}
              </Space>
              <Space direction="vertical">
                {entry.itemsIds.map((itemId) => (
                  <Item key={itemId} id={itemId} width={50} />
                ))}
              </Space>
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
          <Space direction="vertical" style={{ maxHeight: 200, overflowY: 'auto' }}>
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
      {dataLoad.warnings.map((warning) => (
        <Alert key={warning} message={warning} type="warning" showIcon />
      ))}
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
