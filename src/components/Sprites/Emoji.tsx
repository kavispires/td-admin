import clsx from 'clsx';
// Components
import { DEFAULT_PADDING, DEFAULT_SPRITE_SIZE, Sprite } from './Sprite';

type EmojiProps = {
  /**
   * The id of the emoji
   */
  emojiId: string;
  /**
   * The width of the emoji (default: 72)
   */
  width?: number;
  /**
   * The padding size
   */
  padding?: number;
  /**
   * Optional class name
   */
  className?: string;
} & ElementProps;

/**
 * An emoji card component.
 */
export function Emoji({
  emojiId,
  width = DEFAULT_SPRITE_SIZE,
  padding = DEFAULT_PADDING,
  className,
  ...rest
}: EmojiProps) {
  const id = emojiId.startsWith('emoji') ? emojiId : `emoji-${emojiId}`;

  const divPadding = padding === 0 ? { padding: 0 } : {};

  return (
    <div
      {...rest}
      className={clsx('sprite', className)}
      style={{ ...rest.style, width: `${width}px`, height: `${width}px`, ...divPadding }}
    >
      <Sprite source="emojis" spriteId={id} width={width} />
    </div>
  );
}

/**
 * An emoji sprite component.
 */
export function EmojiSprite({
  emojiId,
  width = DEFAULT_SPRITE_SIZE,
  ...props
}: Pick<EmojiProps, 'emojiId' | 'width'> & ElementProps) {
  const id = emojiId.startsWith('emoji') ? emojiId : `emoji-${emojiId}`;
  return <Sprite padding={0} source="emojis" spriteId={id} width={width} {...props} />;
}
