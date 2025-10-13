import clsx from 'clsx';
import { memoize } from 'lodash';
// Components
import { DEFAULT_PADDING, DEFAULT_SPRITE_SIZE, Sprite } from './Sprite';

export type ItemProps = {
  /**
   * The id of the item
   */
  itemId: string;
  /**
   * The width of the item
   */
  width?: number;
  /**
   * Optional class name
   */
  className?: string;
  /**
   * Replacement title, usually the name of the item
   */
  title?: string;
  /**
   * Optional text to display
   */
  text?: DualLanguageValue;
  /**
   * Optional padding
   */
  padding?: number;
} & ElementProps;
const BASE = 64;

/**
 * Retrieves the source and item ID based on a given string.
 *
 * @param str - The input string.
 * @returns An array containing the source and item ID.
 */
const getSource = memoize((str: string) => {
  const match = str.match(/\d+/);
  const numId = match ? Number.parseInt(match[0], 10) : 0;
  const itemId = `item-${numId}`;
  const sourceId = Math.ceil(numId / BASE) * BASE;
  const source = `items-${sourceId}`;
  return [source, itemId];
});

/**
 * An item card component.
 */
export function Item({
  itemId,
  width = DEFAULT_SPRITE_SIZE,
  className,
  title,
  text,
  padding = DEFAULT_PADDING,
  ...rest
}: ItemProps) {
  const [source, id] = getSource(itemId);

  const height = text ? 'auto' : `${width}px`;
  const divPadding = padding === 0 ? { padding: 0 } : {};

  return (
    <div
      {...rest}
      className={clsx('item-card', className)}
      style={{ ...rest.style, width: `${width}px`, height, ...divPadding }}
    >
      <Sprite padding={padding} source={source} spriteId={id} title={title} width={width} />
    </div>
  );
}

/**
 * An item sprite component.
 */
export function ItemSprite({
  itemId,
  width = DEFAULT_SPRITE_SIZE,
  ...props
}: Pick<ItemProps, 'itemId' | 'width'> & ElementProps) {
  const [source, id] = getSource(itemId);
  return <Sprite padding={0} source={source} spriteId={id} width={width} {...props} />;
}
