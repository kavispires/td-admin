import clsx from 'clsx';
// Components
import { Sprite } from './Sprite';

type EmojiProps = {
  /**
   * The id of the emoji
   */
  id: string;
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
export function Emoji({ id, width, className }: EmojiProps): JSX.Element {
  const emojiId = id.startsWith('emoji') ? id : `emoji-${id}`;

  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px` }}>
      <Sprite source="emojis" id={emojiId} width={width} />
    </div>
  );
}
