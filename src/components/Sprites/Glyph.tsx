import clsx from 'clsx';
// Components
import { DEFAULT_PADDING, DEFAULT_SPRITE_SIZE, Sprite } from './Sprite';

type GlyphProps = {
  /**
   * The id of the glyph
   */
  glyphId: number | string;
  /**
   * The width of the glyph (default: 72)
   */
  width?: number;
  /**
   * Optional class name
   */
  className?: string;
  /**
   * Optional padding
   */
  padding?: number;
} & ElementProps;

const BASE = 128;

/**
 * Retrieves the source and glyph ID based on a given string.
 *
 * @param str - The input string.
 * @returns An array containing the source and glyph ID.
 */
const getSource = (numId: number) => {
  const glyphId = `glyph-${numId}`;
  const sourceId = Math.ceil(numId / BASE) * BASE;
  const source = `glyphs-${sourceId}`;
  return [source, glyphId];
};

/**
 * A glyph card component.
 */
export function Glyph({
  glyphId,
  width = DEFAULT_SPRITE_SIZE,
  padding = DEFAULT_PADDING,
  className,
  ...rest
}: GlyphProps) {
  const [source, id] = getSource(+glyphId);

  const divPadding = padding === 0 ? { padding: 0 } : {};

  return (
    <div
      {...rest}
      className={clsx('sprite', className)}
      style={{ ...rest.style, width: `${width}px`, height: `${width}px`, ...divPadding }}
    >
      <Sprite padding={0} source={source} spriteId={id} width={width} />
    </div>
  );
}

/**
 * A glyph sprite component.
 */
export function GlyphSprite({
  glyphId,
  width = DEFAULT_SPRITE_SIZE,
  ...props
}: Pick<GlyphProps, 'glyphId' | 'width'> & ElementProps) {
  const [source, id] = getSource(+glyphId);
  return <Sprite padding={0} source={source} spriteId={id} width={width} {...props} />;
}
