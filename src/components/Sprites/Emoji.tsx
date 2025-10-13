import clsx from 'clsx';
// Components
import { Sprite } from './Sprite';

type EmojiProps = {
  /**
   * The id of the emoji
   */
  emojiId: string;
  /**
   * The width of the emoji
   */
  width?: number;
  /**
   * Optional class name
   */
  className?: string;
};

/**
 * An emoji card component.
 */
export function Emoji({ emojiId, width, className }: EmojiProps) {
  const id = emojiId.startsWith('emoji') ? emojiId : `emoji-${emojiId}`;

  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px` }}>
      <Sprite source="emojis" spriteId={id} width={width} />
    </div>
  );
}
