import { EyeFilled } from '@ant-design/icons';
import { Alert, Button, Flex, Popover, Space, type TableColumnsType, Tag, Typography } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { ImageCard } from 'components/Images/ImageCard';
import { AlienSign, Item } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
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
function GamePopover({ children, entry }: { children: ReactNode; entry: DailyEntry[keyof DailyEntry] }) {
  return (
    <Popover
      content={children}
      title={
        <Flex justify="space-between">
          <Typography.Text>Sneak Peek</Typography.Text>
          <CopyToClipboardButton content={JSON.stringify(entry)} />
        </Flex>
      }
      trigger="click"
    >
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
          <GamePopover entry={entry}>
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
                  <CanvasSVG className="canvas" drawing={d} height={75} key={d} width={75} />
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

          <GamePopover entry={entry}>
            <Flex gap={6} style={{ maxWidth: 500 }} wrap>
              {itemsIds.map((itemId) => (
                <Item itemId={itemId} key={itemId} width={48} />
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

          <GamePopover entry={entry}>
            <Flex gap={6} style={{ maxWidth: '300px' }} vertical>
              <Space wrap>
                {attributes.map((req) => (
                  <AlienSign key={req.spriteId} signId={`sign-${req.spriteId}`} width={48} />
                ))}
              </Space>
              <Space wrap>
                {itemsIds.map((itemId) => (
                  <Item itemId={itemId} key={itemId} width={48} />
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

      const { number, rule1, intersectingThing, rule2, title, things } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Title">{title}</GameInfo>

          <GamePopover entry={entry}>
            <Flex gap={6} vertical>
              <Flex gap={6}>
                <Item itemId={rule1.thing.id} width={48} />
                <Item itemId={intersectingThing.id} width={48} />
                <Item itemId={rule2.thing.id} width={48} />
              </Flex>
              <Flex gap={6}>
                {things.map((thing) => (
                  <Item itemId={thing.id} key={thing.id} width={35} />
                ))}
              </Flex>
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

          <GamePopover entry={entry}>
            <Flex gap={6} style={{ maxWidth: 245 }} wrap>
              {goods.map((good) => (
                <WarehouseGood goodId={good} key={good} width={48} />
              ))}
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
  {
    title: 'Espionagem',
    dataIndex: 'espionagem',
    key: 'espionagem',
    render: (entry: DailyEntry['espionagem']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, statements, additionalStatements, suspects, culpritId } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>

          <GameInfo label="Suspects">{suspects.length}</GameInfo>
          <GameInfo label="Culprit">{culpritId}</GameInfo>
          <GameInfo label="Statements">{statements.length}</GameInfo>

          <GamePopover entry={entry}>
            <Flex gap={6} vertical>
              <Space style={{ maxHeight: 200, overflowY: 'auto' }} wrap>
                {suspects.map((suspect) => (
                  <SuspectImageCard cardId={suspect.id} cardWidth={48} key={suspect.id} />
                ))}
              </Space>

              {statements.slice(0, 3).map((statement) => (
                <Alert banner key={statement.key} message={statement.text} showIcon type="info" />
              ))}

              {additionalStatements.map((statement) => (
                <Alert banner key={statement.key} message={statement.text} showIcon type="warning" />
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

          <GamePopover entry={entry}>
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
    title: 'Organiku',
    dataIndex: 'organiku',
    key: 'organiku',
    render: (entry: DailyEntry['organiku']) => {
      if (!entry) {
        return <Alert message="No entry" type="error" />;
      }

      const { number, setId, title, grid, defaultRevealedIndexes } = entry;

      return (
        <EntryCell>
          <GameNumber>{number}</GameNumber>
          <GameInfo label="SetId">{setId}</GameInfo>
          <GameInfo label="Title">{title}</GameInfo>

          <GamePopover entry={entry}>
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${grid?.length % 5 === 0 ? 5 : 6}, 1fr)`, gap: '8px' }}
            >
              {(grid ?? []).map((itemId, index) => (
                <div className="grid-item" key={`${itemId}-${index}`}>
                  <Item
                    className={defaultRevealedIndexes.includes(index) ? 'red-border' : ''}
                    itemId={!defaultRevealedIndexes.includes(index) ? '0' : itemId || '0'}
                    width={48}
                  />
                </div>
              ))}
            </div>
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

          <GamePopover entry={entry}>
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

          <GamePopover entry={entry}>
            <Flex gap={6} vertical>
              {corridors.map((c) => (
                <Flex gap={6} key={c.passcode} vertical>
                  <span>
                    Passcode: {c.passcode} ({c.goal})
                  </span>
                  <Flex>
                    {c.imagesIds.map((i) => (
                      <ImageCard cardId={i} cardWidth={48} key={i} />
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

          <GamePopover entry={entry}>
            <Flex gap={6}>
              {sets.map((s) => (
                <Flex gap={6} key={s.id} vertical>
                  {s.itemsIds.map((i) => (
                    <Item itemId={i} key={i} width={48} />
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

          <GamePopover entry={entry}>
            <Flex gap={6} style={{ maxHeight: 500, overflowY: 'auto' }} vertical>
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

          <GamePopover entry={entry}>
            <Flex vertical>
              <Space direction="vertical" style={{ maxHeight: 100, overflowY: 'auto' }}>
                {testimonies.map((question) => (
                  <Flex key={question.testimonyId} vertical>
                    <span>
                      {question.question} ({question.testimonyId})
                    </span>
                    <Flex>
                      {question.suspectsIds?.map((suspectId) => (
                        <ImageCard cardId={suspectId} cardWidth={48} key={suspectId} />
                      ))}
                    </Flex>
                  </Flex>
                ))}
              </Space>
              <Space style={{ maxHeight: 200, maxWidth: '500px', overflowY: 'auto' }} wrap>
                {suspectsIds?.map((suspectId) => (
                  <ImageCard cardId={suspectId} cardWidth={48} key={suspectId} />
                ))}
              </Space>
            </Flex>
          </GamePopover>
        </EntryCell>
      );
    },
  },
];
