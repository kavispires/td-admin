import { WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Spin, Tooltip } from 'antd';
import { useBaseUrl } from 'hooks/useBaseUrl';

type SpriteProps = {
  /**
   * The sprite source name
   */
  source: string;
  /**
   * The id of the item
   */
  id: string;
  /**
   * The width of the item
   */
  width?: number;
  /**
   * Replacement title, usually the name of the item
   */
  title?: string;
  /**
   * Optional class name
   */
  className?: string;
  /**
   *
   */
  padding?: number;
};

/**
 * Loads a sprite from the Tarde Divertida sprites
 * @param {SpriteProps} props
 * @returns a single sprite item
 */
export function Sprite({ id, source, width = 75, padding = 6, title, className }: SpriteProps) {
  const { getUrl } = useBaseUrl('tdi');

  const { isLoading, data, isError } = useQuery({
    queryKey: ['sprite', source],
    queryFn: async () => {
      const response = await fetch(`${getUrl('sprites')}/${source}.svg`);
      return await response.text();
    },
    enabled: !!id && !!source,
  });

  const paddedWidth = width - 12;

  if (isLoading) {
    return (
      <span
        style={{
          width: `${paddedWidth}px`,
          height: `${paddedWidth}px`,
          padding,
          display: 'grid',
          placeItems: 'center',
        }}
        className={className}
      >
        <Spin />
      </span>
    );
  }

  const svgContent = data;

  if (isError || !svgContent) {
    return (
      <span
        style={{
          width: `${paddedWidth}px`,
          height: `${paddedWidth}px`,
          padding,
          display: 'grid',
          placeItems: 'center',
        }}
        className={className}
      >
        <WarningOutlined />
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      style={{ width: `${paddedWidth}px`, height: `${paddedWidth}px`, padding }}
      className={className}
    >
      <use xlinkHref={`#${id}`} dangerouslySetInnerHTML={{ __html: svgContent }} />
      <foreignObject x="0" y="0" width="100%" height="100%">
        {title && (
          <Tooltip title={title}>
            <div style={{ background: 'transparent', width: '100%', height: '100vh' }}></div>
          </Tooltip>
        )}
      </foreignObject>
    </svg>
  );
}
