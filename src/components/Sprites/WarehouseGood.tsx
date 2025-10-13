import clsx from 'clsx';
// Components
import { DEFAULT_PADDING, DEFAULT_SPRITE_SIZE, Sprite } from './Sprite';

type WarehouseGoodProps = {
  /**
   * The id of the warehouse good
   */
  goodId: string;
  /**
   * The width of the warehouse good
   */
  width?: number;
  /**
   * Optional class name
   */
  className?: string;
  /**
   * Replacement title, usually the name of the warehouse good
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
export function WarehouseGood({
  goodId,
  width = DEFAULT_SPRITE_SIZE,
  className,
  title,
  text,
  padding = DEFAULT_PADDING,
  ...rest
}: WarehouseGoodProps) {
  const [source, id] = getSource(goodId);

  const height = text ? 'auto' : `${width}px`;
  const divPadding = padding === 0 ? { padding: 0 } : {};

  return (
    <div
      {...rest}
      className={clsx('sprite', className)}
      style={{ ...rest.style, width: `${width}px`, height, ...divPadding }}
    >
      <Sprite source={source} spriteId={id} width={width} />
    </div>
  );
}

export function WarehouseGoodSprite({
  goodId,
  width = DEFAULT_SPRITE_SIZE,
  ...props
}: Pick<WarehouseGoodProps, 'goodId' | 'width'> & ElementProps) {
  const [source, id] = getSource(goodId);
  return <Sprite padding={0} source={source} spriteId={id} width={width} {...props} />;
}
