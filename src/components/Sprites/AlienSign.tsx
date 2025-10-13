import clsx from 'clsx';
// Components
import { DEFAULT_PADDING, DEFAULT_SPRITE_SIZE, Sprite } from './Sprite';

type AlienSignProps = {
  /**
   * The id of the sign (do not prefix with sign)
   */
  signId: string | number;
  /**
   * The width of the sign (default: 72)
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

/**
 * An alien sign card component.
 */
export function AlienSign({
  signId,
  width = DEFAULT_SPRITE_SIZE,
  padding = DEFAULT_PADDING,
  className = '',
  ...rest
}: AlienSignProps) {
  const divPadding = padding === 0 ? { padding: 0 } : {};

  return (
    <div
      {...rest}
      className={clsx('sprite', className)}
      style={{ ...rest.style, width: `${width}px`, height: `${width}px`, ...divPadding }}
    >
      <Sprite padding={padding} source="alien-signs" spriteId={`sign-${signId}`} width={width} />
    </div>
  );
}

/**
 * An alien sign sprite component.
 */
export function AlienSignSprite({
  signId,
  width = DEFAULT_SPRITE_SIZE,
  ...props
}: Pick<AlienSignProps, 'signId' | 'width'> & ElementProps) {
  const id = String(signId).startsWith('sign') ? String(signId) : `sign-${signId}`;
  return <Sprite padding={0} source="alien-signs" spriteId={id} width={width} {...props} />;
}
