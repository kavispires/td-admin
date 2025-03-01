import { Alert, Button, Flex, Popover, Space, Table, Tag, type TableColumnsType } from 'antd';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { ImageCard } from 'components/Images/ImageCard';
import { AlienSign, Item } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import type { ArteRuimCard } from 'types';
import { type DailyEntry, type UseLoadDailySetup, useSaveDailySetup } from './hooks';
import { truncate } from 'lodash';
import { EyeFilled } from '@ant-design/icons';

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
      fixed: 'left',
    },
    {
      title: 'Arte Ruim',
      dataIndex: 'arte-ruim',
      key: 'arte-ruim',
      render: ({ number, cardId, text, drawings }: DailyEntry['arte-ruim']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>

            <span>CardId: {cardId}</span>
            <span>Drawings: {drawings.length}</span>

            <Popover
              trigger="click"
              content={
                <Flex gap={6} vertical>
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
                </Flex>
              }
              title="Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Aqui O',
      dataIndex: 'aqui-o',
      key: 'aqui-o',
      render: ({ number, setId, title, itemsIds }: DailyEntry['aqui-o']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>SetId: {setId}</span>
            <span>Title: {title.pt}</span>
            <span>Items: {itemsIds.length}</span>
            <Popover
              trigger="click"
              content={
                <Flex gap={6} wrap style={{ maxWidth: 500 }}>
                  {itemsIds.map((itemId) => (
                    <Item key={itemId} id={itemId} width={50} />
                  ))}
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
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
            <Tag color="cyan">#{number}</Tag>
            <span>Letters: {letters.length}</span>
            <span>Keyword: {keyword}</span>
            <Popover
              trigger="click"
              content={
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
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Filmaço',
      dataIndex: 'filmaco',
      key: 'filmaco',
      render: ({ number, setId, year, title }: DailyEntry['filmaco']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>SetId: {setId}</span>
            <Popover
              trigger="click"
              content={
                <Flex gap={6} vertical>
                  <span>Year: {year}</span>

                  <span>
                    Title:{' '}
                    {title
                      .split('')
                      .map((l: string, i: number) => (i < 1 || l === ' ' ? l : '⏹'))
                      .join('')}
                  </span>
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Controle de Estoque',
      dataIndex: 'controle-de-estoque',
      key: 'controle-de-estoque',
      render: ({ number, title, goods }: DailyEntry['controle-de-estoque']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>Title: {title}</span>

            <Popover
              trigger="click"
              content={
                <Flex gap={6} wrap style={{ maxWidth: 245 }}>
                  {goods.map((good) => (
                    <WarehouseGood key={good} id={good} width={50} />
                  ))}
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Teoria de Conjuntos',
      dataIndex: 'teoria-de-conjuntos',
      key: 'teoria-de-conjuntos',
      render: ({ number, title, intersectingThing, rule1, rule2 }: DailyEntry['teoria-de-conjuntos']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>Title: {title}</span>
            <Popover
              trigger="click"
              content={
                <Flex gap={6}>
                  <Item id={rule1.thing.id} width={50} />
                  <Item id={intersectingThing.id} width={50} />
                  <Item id={rule2.thing.id} width={50} />
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Comunicação Alienígena',
      dataIndex: 'comunicacao-alienigena',
      key: 'comunicacao-alienigena',
      render: (entry: DailyEntry['comunicacao-alienigena']) => {
        if (!entry) {
          return <Alert message="No entry" type="error" />;
        }

        return (
          <Space direction="vertical">
            <Tag color="cyan">#{entry.number}</Tag>
            <span>{entry.itemsIds.length} items</span>

            <Popover
              trigger="click"
              content={
                <Flex gap={6} style={{ maxWidth: '300px' }} vertical>
                  <Space wrap>
                    {entry.attributes.map((req) => (
                      <AlienSign key={req.spriteId} id={`sign-${req.spriteId}`} width={50} />
                    ))}
                  </Space>
                  <Space wrap>
                    {entry.itemsIds.map((itemId) => (
                      <Item key={itemId} id={itemId} width={50} />
                    ))}
                  </Space>
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>

            <Space></Space>
          </Space>
        );
      },
    },
    {
      title: 'Quartetos',
      dataIndex: 'quartetos',
      key: 'quartetos',
      render: ({ number, setId, sets }: DailyEntry['quartetos']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>SetId: {truncate(setId, { length: 9 })}</span>

            <Popover
              trigger="click"
              content={
                <Flex gap={6}>
                  {sets.map((s) => (
                    <Flex key={s.id} gap={6} vertical>
                      {s.itemsIds.map((i) => (
                        <Item key={i} id={i} width={50} />
                      ))}
                    </Flex>
                  ))}
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
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
            <Tag color="cyan">#{number}</Tag>
            <span>{cards.length} cards</span>
            <Popover
              trigger="click"
              content={
                <Flex gap={6} vertical style={{ maxHeight: 500, overflowY: 'auto' }}>
                  {cards.map((card: ArteRuimCard, index: number) => (
                    <span key={`${card.id}-${index}`}>{card.text}</span>
                  ))}
                </Flex>
              }
              title="Sneak Peek"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
          </Space>
        );
      },
    },
    {
      title: 'Tá Na Cara',
      dataIndex: 'ta-na-cara',
      key: 'ta-na-cara',
      render: ({ number, suspectsIds, testimonies }: DailyEntry['ta-na-cara']) => {
        return (
          <Space direction="vertical">
            <Tag color="cyan">#{number}</Tag>
            <span>{suspectsIds?.length} suspects</span>
            <span>{testimonies.length} questions</span>

            <Popover
              trigger="click"
              content={
                <Flex vertical>
                  <Space direction="vertical" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {testimonies.map((question) => (
                      <span key={question.testimonyId}>{question.question}</span>
                    ))}
                  </Space>
                  <Space wrap style={{ maxHeight: 200, maxWidth: '500px', overflowY: 'auto' }}>
                    {suspectsIds?.map((suspectId) => (
                      <ImageCard key={suspectId} id={suspectId} width={48} />
                    ))}
                  </Space>
                </Flex>
              }
              title="Cards"
            >
              <Button icon={<EyeFilled />} />
            </Popover>
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
        <h4>Total: {dataLoad.entries.length}</h4>
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
      <Table columns={columns} dataSource={dataLoad.entries ?? []} scroll={{ x: 'max-content' }} />
    </div>
  );
}
