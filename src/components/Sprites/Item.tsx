import clsx from 'clsx';
import { memoize } from 'lodash';
// Components
import { Sprite } from './Sprite';

export type ItemProps = {
  /**
   * The id of the item
   */
  id: string;
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
};

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
export function Item({ id, width, className, title }: ItemProps) {
  const [source, itemId] = getSource(id);

  return (
    <div
      className={clsx('sprite', className)}
      style={{ width: `${width ?? 75}px`, height: `${width ?? 75}px` }}
    >
      <Sprite source={source} id={itemId} width={width} title={title} />
    </div>
  );
}
