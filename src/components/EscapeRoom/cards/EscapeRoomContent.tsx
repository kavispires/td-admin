// Ant Design Resources
import { Alert } from 'antd';
import clsx from 'clsx';
import { ImageCard } from 'components/Images/ImageCard';
// Internal
import { CenterBox, getBoxClasses, Sprite, TextBox, Title } from './CardBuildingBlocks';
import {
  CARD_CONTENT_TYPES,
  type CalendarContent,
  type EscapeRoomCardContentType,
  type ImageCardContent,
  type ImageCardSequenceContent,
  type SpriteContent,
  type SpriteGridContent,
  type SpriteSequenceContent,
  type TextBoxContent,
  type TitleContent,
} from './escape-room-types';

export const ContentDelegator = ({
  content,
  width,
}: {
  content: EscapeRoomCardContentType;
  width: number;
}) => {
  switch (content.type) {
    case CARD_CONTENT_TYPES.AUDIO:
      return <Alert showIcon title="Audio not implemented" type="error" />;
    case CARD_CONTENT_TYPES.CALENDAR:
      return <Alert showIcon title="Calendar not implemented" type="error" />;
    case CARD_CONTENT_TYPES.CODEX:
      return <Alert showIcon title="Codex not implemented" type="error" />;
    case CARD_CONTENT_TYPES.DIGIT:
      return <Alert showIcon title="Digit not implemented" type="error" />;
    case CARD_CONTENT_TYPES.IMAGE_CARD:
      return <ImageCardContentComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.IMAGE_CARD_COVER:
      return <Alert showIcon title="Image Card Cover not implemented" type="error" />;
    case CARD_CONTENT_TYPES.IMAGE_CARD_SEQUENCE:
      return <ImageCardSequenceContentComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.LABEL:
      return <Alert showIcon title="Label not implemented" type="error" />;
    case CARD_CONTENT_TYPES.LETTER:
      return <Alert showIcon title="Letter not implemented" type="error" />;
    case CARD_CONTENT_TYPES.NUMBER:
      return <Alert showIcon title="Number not implemented" type="error" />;
    case CARD_CONTENT_TYPES.SPRITE:
      return <SpriteContentComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.SPRITE_GRID:
      return <SpriteGridContentComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.SPRITE_SEQUENCE:
      return <SpriteSequenceComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.SPRITE_SHUFFLE:
      return <Alert showIcon title="Sprite Shuffle not implemented" type="error" />;
    case CARD_CONTENT_TYPES.SPRITE_WHEEL:
      return <Alert showIcon title="Sprite Wheel not implemented" type="error" />;
    case CARD_CONTENT_TYPES.TEXT_BOX:
      return <TextBoxContentComponent content={content} width={width} />;
    case CARD_CONTENT_TYPES.TITLE:
      return <TitleContentComponent content={content} width={width} />;
    default:
      return <Alert showIcon title={`Content type ${content.type} not implemented`} type="error" />;
  }
};

type ContentComponentProps<T> = { width: number } & {
  content: T;
};

function TextBoxContentComponent({ content }: ContentComponentProps<TextBoxContent>) {
  const { text, ...props } = content;
  return <TextBox {...props}>{text}</TextBox>;
}

function TitleContentComponent({ content }: ContentComponentProps<TitleContent>) {
  const { text, ...props } = content;
  return <Title {...props}>{text}</Title>;
}

function SpriteContentComponent({ content, width }: ContentComponentProps<SpriteContent>) {
  const { scale = 1 } = content;
  return (
    <CenterBox>
      <Sprite {...content} width={(width / 5) * scale} />
    </CenterBox>
  );
}

function SpriteSequenceComponent({ content, width }: ContentComponentProps<SpriteSequenceContent>) {
  const { library, spriteIds } = content;

  return (
    <div className={clsx('er-flex')}>
      {spriteIds.map((spriteId, index) => (
        <Sprite
          key={`${spriteId}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: there could be duplicates
            index
          }`}
          library={library}
          spriteId={spriteId}
          width={(width / 7) * 1}
        />
      ))}
    </div>
  );
}

function SpriteGridContentComponent({ content, width }: ContentComponentProps<SpriteGridContent>) {
  const { library, spriteIds, scale, rotate } = content;

  return (
    <div className={clsx('er-flex')}>
      {spriteIds.map((spriteId, index) =>
        spriteId ? (
          <Sprite
            key={`${spriteId}-${
              // biome-ignore lint/suspicious/noArrayIndexKey: there could be duplicates
              index
            }`}
            library={library}
            spriteId={spriteId}
            width={(width / 7) * 1}
          />
        ) : (
          <div
            className="er-sprite-grid-placeholder"
            key={`${spriteId}-${
              // biome-ignore lint/suspicious/noArrayIndexKey: there could be duplicates
              index
            }`}
          />
        ),
      )}
    </div>
  );
}

function ImageCardContentComponent({ content, width }: ContentComponentProps<ImageCardContent>) {
  const { cardId, align = 'center', scale = 1 } = content;
  return (
    <ImageCard
      cardId={cardId}
      cardWidth={(width / 6) * scale}
      className={clsx(getBoxClasses('text', { align }), 'er-image-card')}
    />
  );
}

function ImageCardSequenceContentComponent({
  content,
  width,
}: ContentComponentProps<ImageCardSequenceContent>) {
  const { cardIds, align = 'center', scale = 1 } = content;
  return (
    <div className={clsx('er-flex', getBoxClasses('box', { align }))}>
      {cardIds.map((cardId, index) => (
        <ImageCard
          cardId={cardId}
          cardWidth={(width / 8) * scale}
          className="er-image-card"
          key={`${cardId}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: there could be duplicates
            index
          }`}
        />
      ))}
    </div>
  );
}

function CalendarContentComponent({ content }: ContentComponentProps<CalendarContent>) {
  return <Alert showIcon title="Calendar not implemented" type="error" />;
}
