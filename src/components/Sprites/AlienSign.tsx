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
};

/**
 * An alien sign card component.
 */
export function AlienSign({ id, width = 75, className = '' }: AlienSignProps) {
  return (
    <div className={clsx('sprite', className)} style={{ width: `${width}px`, height: `${width}px` }}>
      <svg viewBox="0 0 512 512" style={{ width: `${width - 12}px`, height: `${width - 12}px` }}>
        <Sprite source="alien-signs" id={id} width={width} />
      </svg>
    </div>
  );
}
