import clsx from 'clsx';
// Components
import { Sprite } from './Sprite';

type AlienSignProps = {
  /**
   * The id of the sign (do not prefix with sign)
   */
  id: string;
  /**
   * The width of the sign
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
};

/**
 * An alien sign card component.
 */
export function AlienSign({ id, width = 75, padding = 6, className = '' }: AlienSignProps) {
  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px`, padding }}>
      <svg
        viewBox="0 0 512 512"
        style={{ width: `${width - padding * 2}px`, height: `${width - padding * 2}px` }}
      >
        <Sprite source="alien-signs" id={id} width={width} />
      </svg>
    </div>
  );
}
