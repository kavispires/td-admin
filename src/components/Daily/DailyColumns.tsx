import { EyeFilled } from '@ant-design/icons';
import { Alert, Button, Flex, Popover, Space, type TableColumnsType, Tag, Typography } from 'antd';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { ImageCard } from 'components/Images/ImageCard';
import { AlienSign, Item } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import { truncate } from 'lodash';
import type { ReactNode } from 'react';
import type { ArteRuimCard } from 'types';
import type { DailyEntry } from './hooks';

function EntryCell({ children }: { children: ReactNode }) {
  return (
    <Space direction="vertical" style={{ maxWidth: 120 }}>
      {children}
    </Space>
  );
}
function GameNumber({ children }: { children: number }) {
  return <Tag color="cyan">#{children}</Tag>;
}
function GameInfo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Typography.Text>
      <strong>{label}:</strong> {children}
    </Typography.Text>
  );
}
function GamePopover({ children }: { children: ReactNode }) {
  return (
    <Popover trigger="click" content={children} title="Sneak Peek">
      <Button icon={<EyeFilled />} />
    </Popover>
  );
}

export const dailyColumns: TableColumnsType<DailyEntry> = [
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
    render: (entry: DailyEntry['arte-ruim']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, cardId, text, drawings } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="CardId">{cardId}</GameInfo>
          <GameInfo label="Drawings">{drawings.length}</GameInfo>
          <GamePopover>
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
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Aqui O',
    dataIndex: 'aqui-o',
    key: 'aqui-o',
    render: (entry: DailyEntry['aqui-o']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, setId, title, itemsIds } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="SetId">{setId}</GameInfo>
          <GameInfo label="Title">{title.pt}</GameInfo>
          <GameInfo label="Items">{itemsIds.length}</GameInfo>

          <GamePopover>
            <Flex gap={6} wrap style={{ maxWidth: 500 }}>
              {itemsIds.map((itemId) => (
                <Item key={itemId} id={itemId} width={50} />
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Alienígena',
    dataIndex: 'comunicacao-alienigena',
    key: 'comunicacao-alienigena',
    render: (entry: DailyEntry['comunicacao-alienigena']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, itemsIds, attributes } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Items">{itemsIds.length}</GameInfo>

          <GamePopover>
            <Flex gap={6} style={{ maxWidth: '300px' }} vertical>
              <Space wrap>
                {attributes.map((req) => (
                  <AlienSign key={req.spriteId} id={`sign-${req.spriteId}`} width={50} />
                ))}
              </Space>
              <Space wrap>
                {itemsIds.map((itemId) => (
                  <Item key={itemId} id={itemId} width={50} />
                ))}
              </Space>
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Conjuntos',
    dataIndex: 'teoria-de-conjuntos',
    key: 'teoria-de-conjuntos',
    render: (entry: DailyEntry['teoria-de-conjuntos']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, rule1, intersectingThing, rule2, title } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Title">{title}</GameInfo>

          <GamePopover>
            <Flex gap={6}>
              <Item id={rule1.thing.id} width={50} />
              <Item id={intersectingThing.id} width={50} />
              <Item id={rule2.thing.id} width={50} />
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Estoque',
    dataIndex: 'controle-de-estoque',
    key: 'controle-de-estoque',
    render: (entry: DailyEntry['controle-de-estoque']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, title, goods } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Title">{title}</GameInfo>
          <GameInfo label="Goods">{goods.length}</GameInfo>

          <GamePopover>
            <Flex gap={6} wrap style={{ maxWidth: 245 }}>
              {goods.map((good) => (
                <WarehouseGood key={good} id={good} width={50} />
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Filmaço',
    dataIndex: 'filmaco',
    key: 'filmaco',
    render: (entry: DailyEntry['filmaco']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }
      const { number, setId, title, year } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="SetId">{setId}</GameInfo>

          <GamePopover>
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
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Palavreado',
    dataIndex: 'palavreado',
    key: 'palavreado',
    render: (entry) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, letters, keyword, words } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Letters">{letters.length}</GameInfo>
          <GameInfo label="Keyword">{keyword}</GameInfo>

          <GamePopover>
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
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Portais',
    dataIndex: 'portais-magicos',
    key: 'portais-magicos',
    render: (entry: DailyEntry['portais-magicos']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, setId, corridors } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="SetId">{truncate(setId, { length: 9 })}</GameInfo>

          <GamePopover>
            <Flex gap={6} vertical>
              {corridors.map((c) => (
                <Flex key={c.passcode} gap={6} vertical>
                  <span>Passcode: {c.passcode}</span>
                  <Flex>
                    {c.imagesIds.map((i) => (
                      <ImageCard key={i} id={i} width={50} />
                    ))}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Quartetos',
    dataIndex: 'quartetos',
    key: 'quartetos',
    render: (entry: DailyEntry['quartetos']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, setId, sets } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="SetId">{truncate(setId, { length: 9 })}</GameInfo>

          <GamePopover>
            <Flex gap={6}>
              {sets.map((s) => (
                <Flex key={s.id} gap={6} vertical>
                  {s.itemsIds.map((i) => (
                    <Item key={i} id={i} width={50} />
                  ))}
                </Flex>
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Picaço',
    dataIndex: 'artista',
    key: 'artista',
    render: (entry) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, cards } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Cards">{cards.length}</GameInfo>

          <GamePopover>
            <Flex gap={6} vertical style={{ maxHeight: 500, overflowY: 'auto' }}>
              {cards.map((card: ArteRuimCard, index: number) => (
                <span key={`${card.id}-${index}`}>{card.text}</span>
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Tá Na Cara',
    dataIndex: 'ta-na-cara',
    key: 'ta-na-cara',
    render: (entry: DailyEntry['ta-na-cara']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, suspectsIds, testimonies } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Suspects">{suspectsIds?.length}</GameInfo>
          <GameInfo label="Questions">{testimonies.length}</GameInfo>

          <GamePopover>
            <Flex vertical>
              <Space direction="vertical" style={{ maxHeight: 100, overflowY: 'auto' }}>
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
          </GamePopover>
        </EntryCell>
      );
    },
  },
];
