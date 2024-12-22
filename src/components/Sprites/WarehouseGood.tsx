import clsx from 'clsx';
// Components
import { Sprite } from './Sprite';

type WarehouseGoodProps = {
  /**
   * The id of the glyph
   */
  id: string;
  /**
   * The width of the glyph
   */
  width?: number;
  /**
   * Optional class name
   */
  className?: string;
};
const BASE = 64;

/**
 * Retrieves the source and good ID based on a given string.
 *
 * @param str - The input string.
 * @returns An array containing the source and good ID.
 */
export const getSource = (str: string) => {
  const match = str.match(/\d+/);
  const numId = match ? Number.parseInt(match[0], 10) : 0;
  const goodId = `good-${numId}`;
  const sourceId = Math.ceil(numId / BASE) * BASE;
  const source = `warehouse-goods-${sourceId}`;
  return [source, goodId];
};

/**
 * An warehouse good card component.
 */
export function WarehouseGood({ id, width = 75, className }: WarehouseGoodProps) {
  const [source, itemId] = getSource(id);

  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px` }}>
      <Sprite source={source} id={itemId} width={width} />
    </div>
  );
}
