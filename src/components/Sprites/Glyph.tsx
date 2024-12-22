import clsx from 'clsx';
import { memoize } from 'lodash';
// Components
import { Sprite } from './Sprite';

type GlyphProps = {
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

const BASE = 128;

/**
 * Retrieves the source and glyph ID based on a given string.
 *
 * @param str - The input string.
 * @returns An array containing the source and glyph ID.
 */
const getSource = memoize((str: string) => {
  const match = str.match(/\d+/);
  const numId = match ? Number.parseInt(match[0], 10) : 0;
  const glyphId = `glyph-${numId}`;
  const sourceId = Math.ceil(numId / BASE) * BASE;
  const source = `glyphs-${sourceId}`;
  return [source, glyphId];
});

/**
 * A glyph card component.
 */
export function Glyph({ id, width, className }: GlyphProps) {
  const [source, glyphId] = getSource(id);

  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px` }}>
      <Sprite source={source} id={glyphId} width={width} padding={0} />
    </div>
  );
}
