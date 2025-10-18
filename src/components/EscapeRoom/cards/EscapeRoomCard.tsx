// Ant Design Resources
import { Alert } from 'antd';
import { Translate } from 'components/FromTD/Translate';
// Components
import {
  Card,
  CenterBox,
  Content,
  ContentBox,
  Header,
  Label,
  Sprite,
  Subtitle,
  TextBox,
  Title,
} from './CardBuildingBlocks';
import { ContentDelegator } from './EscapeRoomContent';
// Internal
import {
  CARD_TYPES,
  type EscapeRoomAnnouncementType,
  type EscapeRoomCardType,
  type EscapeRoomImageCardType,
  type EscapeRoomMissionCardType,
  type EscapeRoomSpriteCardType,
  type EscapeRoomWordCardType,
} from './escape-room-types';

type EscapeRoomCardProps = {
  card: EscapeRoomCardType;
  width: number;
  onPlayCard?: (cardId: CardId) => void;
};
export const EscapeRoomCard = ({ card, ...props }: EscapeRoomCardProps) => {
  switch (card.type) {
    case CARD_TYPES.ANNOUNCEMENT:
      return <EscapeRoomAnnouncementCard card={card} {...props} />;
    case CARD_TYPES.MISSION:
      return <EscapeRoomMissionCard card={card} {...props} />;
    case CARD_TYPES.WORD:
      return <EscapeRoomWordCard card={card} {...props} />;
    case CARD_TYPES.SPRITE:
      return <EscapeRoomSpriteCard card={card} {...props} />;
    case CARD_TYPES.IMAGE:
      return <EscapeRoomImageCard card={card} {...props} />;
    default:
      return (
        <Alert
          message={`Card type ${card} not implemented`}
          showIcon
          style={{ width: props.width }}
          type="error"
        />
      );
  }
};

type EscapeRoomSpecificCardProps<T> = EscapeRoomCardProps & {
  card: T;
};

const EscapeRoomAnnouncementCard = ({
  card,
  width,
  onPlayCard,
}: EscapeRoomSpecificCardProps<EscapeRoomAnnouncementType>) => {
  const { content } = card;
  return (
    <Card background={card.background} cardId={card.id} onPlayCard={onPlayCard} width={width}>
      <Content rows>
        {content.title && (
          <ContentBox position={content.title.position}>
            <Title
              align={content.title.align ?? 'center'}
              color={content.title.color}
              size={content.title.size}
              variant={content.title.variant}
            >
              {content.title.value}
            </Title>
          </ContentBox>
        )}
        {content.subtitle && (
          <ContentBox position={content.subtitle.position}>
            <Subtitle
              align={content.subtitle.align ?? 'center'}
              color={content.subtitle.color}
              size={content.subtitle.size}
              variant={content.subtitle.variant}
            >
              {content.subtitle.value}
            </Subtitle>
          </ContentBox>
        )}
      </Content>
    </Card>
  );
};

const EscapeRoomMissionCard = ({ card, width }: EscapeRoomSpecificCardProps<EscapeRoomMissionCardType>) => {
  const { content, number } = card;
  return (
    <Card background={card.background ?? 'er/bg/mission.jpg'} cardId={card.id} unplayable width={width}>
      <Header spriteId="mission" style={{ marginTop: '2em', display: 'flex', justifyContent: 'center' }}>
        <Translate en="Mission" pt="Missão" /> #{number}
      </Header>
      <Content style={{ padding: '2em' }}>
        <Title align="center">{content.title.value}</Title>

        <TextBox variant="transparent">{content.paragraphs.value}</TextBox>

        <TextBox variant="boxed">{content.action.value}</TextBox>
      </Content>
    </Card>
  );
};

const EscapeRoomWordCard = ({
  card,
  width,
  onPlayCard,
}: EscapeRoomSpecificCardProps<EscapeRoomWordCardType>) => {
  const { content } = card;

  // Map size to font size
  const fontSize = content.size === 'large' ? '2.5rem' : content.size === 'medium' ? '1.5rem' : '0.9rem';

  return (
    <Card background={card.background} cardId={card.id} onPlayCard={onPlayCard} width={width}>
      <Content rows>
        <ContentBox position={content.position}>
          <span
            className="er-font"
            style={{
              fontSize,
              textAlign: content.align || 'center',
              color: content.color,
              // textShadow: getTextStroke(),
              WebkitTextStroke: content.borderWidth
                ? `${content.borderWidth}px ${content.borderColor || '#000'}`
                : undefined,
              WebkitTextFillColor: content.color || '#000',
              display: 'inline-block',
              fontWeight: 'bold',
            }}
          >
            {content.word}
          </span>
        </ContentBox>
      </Content>
    </Card>
  );
};

const EscapeRoomSpriteCard = ({
  card,
  width,
  onPlayCard,
}: EscapeRoomSpecificCardProps<EscapeRoomSpriteCardType>) => {
  const { content } = card;
  return (
    <Card background={card.background} cardId={card.id} onPlayCard={onPlayCard} width={width}>
      <Content rows>
        <ContentBox position={content.position}>
          <CenterBox>
            <Sprite
              library={content.sprite.library}
              rotate={content.sprite.rotate}
              scale={content.sprite.scale}
              spriteId={content.sprite.spriteId}
              width={width / 2}
            />
            {content.name && <Label>{content.name}</Label>}
            {content.description && <TextBox>{content.description}</TextBox>}
          </CenterBox>
        </ContentBox>
      </Content>
    </Card>
  );
};

const EscapeRoomImageCard = ({
  card,
  width,
  onPlayCard,
}: EscapeRoomSpecificCardProps<EscapeRoomImageCardType>) => {
  return (
    <Card background={card.background} cardId={card.id} onPlayCard={onPlayCard} width={width}>
      <span />
    </Card>
  );
};

// const EscapeRoomContentCard = ({
//   card,
//   width,
//   onPlayCard,
// }: EscapeRoomSpecificCardProps<EscapeRoomContentCardType>) => {
//   return (
//     <Card background={card.background} cardId={card.id} onPlayCard={onPlayCard} width={width}>
//       <Content center={card.content.length === 1} rows={card.content.length > 1}>
//         {card.content.map((entry, index) => (
//           <ContentBox key={`${card.id}-${index}`} position={entry.pos}>
//             <ContentDelegator content={entry} width={width} />
//           </ContentBox>
//         ))}
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomText = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERTextCard>) => {
//   const { text, illustrationId } = card.content;
//   return (
//     <Card cardId={card.id} variant={card.variant} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <CenterBox>
//           {illustrationId && <ERSprite id={illustrationId} width={5} />}
//           <TextBox center>{text}</TextBox>
//         </CenterBox>
//       </Content>
//     </Card>
//   );
// };

// const SpriteContent = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERSpriteCard>) => {
//   const { library, spriteId, name, description, scale = 1, rotate = 0 } = card.content;
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'zoomGrey'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <CenterBox>
//           <Sprite library={library} spriteId={spriteId} scale={scale} rotate={rotate} width={width / 2} />
//           <Label>{name}</Label>
//           <TextBox>{description}</TextBox>
//         </CenterBox>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomSpriteShuffleCard = ({
//   card,
//   width,
//   onPlayCard,
// }: EscapeRoomSpecificCardProps<ERSpriteShuffleCard>) => {
//   const { spriteIds, library } = card.content;
//   const distributedItems = useMemo(() => {
//     const totalElements = 4 * 6;
//     const result: { key: string; value: string | null; scale: number; rotate: number }[] = new Array(
//       totalElements,
//     )
//       .fill(null)
//       .map((_, index) => {
//         return {
//           key: `${card.id}-${index}`,
//           value: null,
//           rotate: index * 15.7 * 360,
//           scale: [1.3, 1.1, 0.9, 1.2, 1][index % 5],
//         };
//       });

//     const step = Math.floor(totalElements / spriteIds.length);

//     spriteIds.forEach((itemId, index) => {
//       const position = step * index;
//       if (result[position]) {
//         result[position].value = itemId;
//       } else {
//         console.error(result.length, position);
//       }
//     });

//     return result;
//   }, [spriteIds, card.id]);

//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'messy'} width={width} onPlayCard={onPlayCard}>
//       <Content>
//         <div className="er-sprite-shuffle">
//           {distributedItems.map((entry) =>
//             entry.value ? (
//               <Sprite
//                 library={library}
//                 key={entry.key}
//                 spriteId={entry.value}
//                 width={width / 5}
//                 rotate={entry.rotate}
//                 scale={entry.scale}
//               />
//             ) : (
//               <div key={entry.key} style={{ width: width / 5, height: width / 5 }} />
//             ),
//           )}
//         </div>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomSpriteGridCard = ({
//   card,
//   width,
//   onPlayCard,
// }: EscapeRoomSpecificCardProps<ERSpriteGridCard>) => {
//   const { library, spriteIds, scale = [1], rotate = [0] } = card.content;
//   const ratio = spriteIds.length;
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'defaultBlack'} width={width} onPlayCard={onPlayCard}>
//       <Content>
//         <div className={clsx('er-sprite-grid', `er-sprite-grid--${library}`, `er-sprite-grid--${ratio}`)}>
//           {spriteIds.map((entry, index) =>
//             entry ? (
//               <Sprite
//                 library={library}
//                 key={`${entry}-${
//                   // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
//                   index
//                 }`}
//                 spriteId={entry}
//                 width={width / 5}
//                 rotate={rotate[ratio % index]}
//                 scale={scale[ratio % index]}
//               />
//             ) : (
//               <div key={entry} style={{ width: width / 5, height: width / 5 }} />
//             ),
//           )}
//         </div>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomSpriteSequenceCard = ({
//   card,
//   width,
//   onPlayCard,
// }: EscapeRoomSpecificCardProps<ERSpriteSequenceCard>) => {
//   const { library, spriteIds, direction = 'horizontal', description } = card.content;

//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <CenterBox>
//           <div className={clsx('er-sprite-sequence', `er-sprite-sequence--${direction}`)}>
//             {spriteIds.map((entry, index) =>
//               entry ? (
//                 <Sprite
//                   library={library}
//                   key={`${entry}-${
//                     // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
//                     index
//                   }`}
//                   spriteId={entry}
//                   width={width / 5}
//                 />
//               ) : (
//                 <div key={entry} style={{ width: width / 5, height: width / 5 }} />
//               ),
//             )}
//           </div>

//           <TextBox>{description}</TextBox>
//         </CenterBox>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomSpriteWheelCard = ({
//   card,
//   width,
//   onPlayCard,
// }: EscapeRoomSpecificCardProps<ERSpriteWheelCard>) => {
//   const { library, spriteIds, colors, description, pointer } = card.content;

//   const numSections = spriteIds.length;

//   if (numSections < 2 || numSections > 12) {
//     return <p>Number of sections must be between 2 and 12.</p>;
//   }

//   const diameter = width - 32;
//   const radius = diameter / 2;
//   const holeRadius = diameter / 3;
//   const angleStep = (2 * Math.PI) / numSections;
//   const iconSize = radius - holeRadius;
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <CenterBox style={{ position: 'relative', width: diameter, height: diameter }}>
//           <svg
//             width={diameter}
//             height={diameter}
//             viewBox={`0 0 ${diameter} ${diameter}`}
//             version="1.1"
//             xmlns="http://www.w3.org/2000/svg"
//             xmlnsXlink="http://www.w3.org/1999/xlink"
//           >
//             <defs>
//               <clipPath id="wheel-hole">
//                 {/* <path d="M100 50A50 50 0 1 1 0 50a50 50 0 0 1 100 0ZM50 16.7a33.3 33.3 0 1 0 0 66.6 33.3 33.3 0 0 0 0-66.6Z" /> */}
//                 <circle cx={radius} cy={radius} r={radius} />
//                 <circle cx={radius} cy={radius} r={holeRadius} fill="white" />
//               </clipPath>
//             </defs>

//             {Array.from({ length: numSections }).map((_, index) => {
//               const startAngle = index * angleStep;
//               const endAngle = startAngle + angleStep;

//               // Calculate points for the SVG path
//               const x1 = radius + radius * Math.cos(startAngle);
//               const y1 = radius + radius * Math.sin(startAngle);
//               const x2 = radius + radius * Math.cos(endAngle);
//               const y2 = radius + radius * Math.sin(endAngle);

//               return (
//                 <path
//                   key={index}
//                   d={`M ${radius},${radius} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`}
//                   fill={colors?.[index % numSections] ?? '#ccc'} // Default to gray if color is null
//                   clipPath="url(#wheel-hole)"
//                 />
//               );
//             })}
//             {/* Inner Hole */}
//             <circle cx={radius} cy={radius} r={holeRadius} fill="#fff" />

//             {pointer !== undefined && (
//               <line
//                 x1={radius}
//                 y1={radius}
//                 x2={radius + radius * Math.cos((pointer - 90) * (Math.PI / 180))}
//                 y2={radius + radius * Math.sin((pointer - 90) * (Math.PI / 180))}
//                 stroke="black"
//                 strokeWidth="3"
//               />
//             )}
//           </svg>

//           {/* Sprites */}
//           {spriteIds.map((sprite, index) => {
//             if (!sprite) return null; // Skip null sprites

//             // const angle = angleStep * index - Math.PI / 2; // Rotate to start at the top
//             // const x = radius + ((radius + holeRadius) / 2) * Math.cos(angle);
//             // const y = radius + ((radius + holeRadius) / 2) * Math.sin(angle);
//             // const angle = index * angleStep + angleStep / 2 - Math.PI / 2; // Offset by -90 degrees to start at the top
//             // const x = radius + ((radius + holeRadius) / 2) * Math.cos(angle); // Centered radius
//             // const y = radius + ((radius + holeRadius) / 2) * Math.sin(angle);
//             const angle =
//               numSections > 6
//                 ? index * angleStep + angleStep / 2 - Math.PI / 2
//                 : angleStep * index - Math.PI / 2; // Offset by -90 degrees to start at the top
//             const distance = (radius + holeRadius) / 2; // Centered between the outer edge and hole
//             const x = radius + distance * Math.cos(angle); // X position
//             const y = radius + distance * Math.sin(angle); // Y position

//             return (
//               <div
//                 key={index}
//                 style={{
//                   position: 'absolute',
//                   left: x - iconSize / 2, // Adjust to center sprite
//                   top: y - iconSize / 2, // Adjust to center sprite
//                   width: iconSize,
//                   height: iconSize,
//                 }}
//               >
//                 <Sprite library={library} spriteId={sprite} width={iconSize} />
//               </div>
//             );
//           })}
//         </CenterBox>

//         <TextBox>{description}</TextBox>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomImageCard = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERImageCard>) => {
//   const { cardId, title, description } = card.content;
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center className="er-image-container">
//         <ImageCover id={cardId} width={width} className="er-image">
//           <Title contained>{title}</Title>
//           <Empty />
//           <TextBox>{description}</TextBox>
//         </ImageCover>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomVoiceCard = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERVoiceCard>) => {
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <div>?</div>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomCalendarCard = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERCalendarCard>) => {
//   const { startAt = 0, totalDays = 30, highlights = [], description, sprite } = card.content;

//   const startingDays = Array.from({ length: startAt }, (_, i) => `null-${i}`);
//   const days = Array.from({ length: totalDays }, (_, index) => {
//     const day = index + 1;
//     return {
//       day,
//       highlight: highlights.includes(index + 1),
//     };
//   });

//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         {sprite && <Sprite library={sprite.library} spriteId={sprite.spriteId} width={width / 5} />}
//         <div className="er-calendar">
//           <span className="er-calendar__header">
//             <Translate en="S" pt="D" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="M" pt="S" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="T" pt="T" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="W" pt="Q" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="T" pt="Q" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="F" pt="S" />
//           </span>
//           <span className="er-calendar__header">
//             <Translate en="S" pt="S" />
//           </span>
//           {startingDays.map((id) => (
//             <span key={id} className="er-calendar__day" />
//           ))}
//           {days.map(({ day, highlight }) => (
//             <span
//               key={day}
//               className={clsx('er-calendar__day', { 'er-calendar__day--highlight': highlight })}
//             >
//               {day}
//             </span>
//           ))}
//         </div>
//         <TextBox>{description}</TextBox>
//       </Content>
//     </Card>
//   );
// };

// const EscapeRoomCodexCard = ({ card, width, onPlayCard }: EscapeRoomSpecificCardProps<ERCodexCard>) => {
//   const { title, table, description } = card.content;
//   return (
//     <Card cardId={card.id} variant={card.variant ?? 'default'} width={width} onPlayCard={onPlayCard}>
//       <Content center>
//         <Title>{title}</Title>
//         <div className="er-codex">
//           {table.map((entry, index) =>
//             typeof entry === 'string' ? (
//               <TextBox key={index} center className="er-codex__entry">
//                 {entry}
//               </TextBox>
//             ) : (
//               <div key={index} className="er-codex__entry">
//                 <Sprite
//                   library={entry.library}
//                   spriteId={entry.spriteId}
//                   width={width / 5}
//                   className="er-codex__entry--sprite"
//                 />
//               </div>
//             ),
//           )}
//         </div>
//         <TextBox>{description}</TextBox>
//       </Content>
//     </Card>
//   );
// };
