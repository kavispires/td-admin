import { Alert, Avatar, Flex } from 'antd';
import {
  CARD_TYPES,
  type ERItemCard,
  type ERTextCard,
  type ERCompleteMissionCard,
  type ERMissionCard,
  type EscapeRoomCardType,
  type ERItemCollectionCard,
} from './types';
import escameRoomSprite from './escape-room-sprite.svg';
import clsx from 'clsx';
import { Item } from 'components/Sprites';
import { useMemo } from 'react';

type EscapeRoomCardProps = {
  card: EscapeRoomCardType;
};
export const EscapeRoomCard = ({ card }: EscapeRoomCardProps) => {
  switch (card.type) {
    case CARD_TYPES.MISSION:
      return <EscapeRoomMissionCard card={card} />;
    case CARD_TYPES.COMPLETE_MISSION:
      return <EscapeRoomCompleteMissionCard card={card} />;
    case CARD_TYPES.TEXT:
      return <EscapeRoomText card={card} />;
    case CARD_TYPES.ITEM:
      return <EscapeRoomItem card={card} />;
    case CARD_TYPES.ITEM_COLLECTION:
      return <EscapeRoomItemCollection card={card} />;
    default:
      return <Alert message={`Card type ${card.type} not implemented`} type="error" showIcon />;
  }
};

type SpriteProps = {
  id: string;
} & React.SVGProps<SVGSVGElement>;
function Sprite({ id, ...props }: SpriteProps) {
  return (
    <svg viewBox="0 0 512 512" {...props}>
      <use href={`${escameRoomSprite}#${id}`}></use>
    </svg>
  );
}

type CardProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
function Card({ children, style, ...props }: CardProps) {
  return (
    <div className="er-card" style={{ width: 200, height: 300, ...style }} {...props}>
      {children}
    </div>
  );
}
type HeaderProps = {
  children: React.ReactNode;
  spriteId?: string;
} & React.HTMLAttributes<HTMLDivElement>;
function Header({ children, spriteId }: HeaderProps) {
  return (
    <div className="er-card-header">
      {spriteId && <Avatar size="small" icon={<Sprite id={spriteId} />} shape="square" />}
      <h2>{children}</h2>
    </div>
  );
}

type ContentProps = {
  children: React.ReactNode;
  center?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
function Content({ children, center, ...props }: ContentProps) {
  return (
    <div className={clsx('er-card-content', center && 'er-card-content--center')} {...props}>
      {children}
    </div>
  );
}

type TitleProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
function Title({ children, ...props }: TitleProps) {
  return (
    <h3 className="er-card-title" {...props}>
      {children}
    </h3>
  );
}

type SubtitleProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
function Subtitle({ children, ...props }: SubtitleProps) {
  return (
    <p className="er-card-subtitle" {...props}>
      {children}
    </p>
  );
}

type EscapeRoomMissionCardProps = {
  card: ERMissionCard;
};
const EscapeRoomMissionCard = ({ card }: EscapeRoomMissionCardProps) => {
  const { number, title, subtitle, paragraphs } = card.content;
  return (
    <Card>
      <Header spriteId="mission">Mission #{number}</Header>
      <Content>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        <ul className="er-text-box er-ul">
          {paragraphs.map((paragraph, index) => (
            <li className="er-paragraph" key={index}>
              {paragraph}
            </li>
          ))}
        </ul>
      </Content>
    </Card>
  );
};

type EscapeRoomCompleteMissionCardProps = {
  card: ERCompleteMissionCard;
};
const EscapeRoomCompleteMissionCard = ({ card: _card }: EscapeRoomCompleteMissionCardProps) => {
  return (
    <Card>
      <Header>Complete Mission</Header>
      <Content center>
        <Sprite id="complete-mission" width={128} />
      </Content>
    </Card>
  );
};

type EscapeRoomTextProps = {
  card: ERTextCard;
};
const EscapeRoomText = ({ card }: EscapeRoomTextProps) => {
  const { text, spriteId } = card.content;
  return (
    <Card>
      <Content center>
        {spriteId && <Sprite id={spriteId} width={64} />}
        <p>{text}</p>
      </Content>
    </Card>
  );
};

type EscapeRoomItemProps = {
  card: ERItemCard;
};
const EscapeRoomItem = ({ card }: EscapeRoomItemProps) => {
  const { itemId, name } = card.content;
  return (
    <Card>
      <Content>
        <Item id={itemId} width={128} />
        <p>{name}</p>
      </Content>
    </Card>
  );
};

type EscapeRoomItemCollectionProps = {
  card: ERItemCollectionCard;
};
const EscapeRoomItemCollection = ({ card }: EscapeRoomItemCollectionProps) => {
  const { itemsIds, pattern, backgroundColor } = card.content;
  const distributedItems = useMemo(() => {
    const totalElements = 30;
    const result = new Array<string | null>(totalElements).fill(null);

    const step = Math.ceil(totalElements / itemsIds.length);

    itemsIds.forEach((itemId, index) => {
      const position = step * (index + 1);
      console.log('position', position);
      result[position] = itemId;
    });

    return result;
  }, [itemsIds]);
  console.log('itemsIds', itemsIds);

  console.log('distributedItems', distributedItems);
  return (
    <Card>
      <Content>
        <Flex wrap="wrap" gap={4}>
          {distributedItems.map((entry, index) =>
            entry ? (
              <Item
                key={`${entry}-${index}`}
                id={entry}
                width={24}
                style={{ padding: 0, width: 24, height: 24 }}
              />
            ) : (
              <div key={Math.random()} style={{ width: 24, height: 24 }} />
            ),
          )}
        </Flex>
      </Content>
    </Card>
  );
};
