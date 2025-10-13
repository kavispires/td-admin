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
  spriteId: string;
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
export function Sprite({ spriteId, source, width = 75, padding = 6, title, className }: SpriteProps) {
  const { getUrl } = useBaseUrl('sprites');

  const { isLoading, data, isError } = useQuery({
    queryKey: ['sprite', source],
    queryFn: async () => {
      const response = await fetch(`${getUrl('sprites')}/${source}.svg`);
      return await response.text();
    },
    enabled: !!spriteId && !!source,
  });

  const paddedWidth = width - 12;

  if (isLoading) {
    return (
      <span
        className={className}
        style={{
          width: `${paddedWidth}px`,
          height: `${paddedWidth}px`,
          padding,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Spin />
      </span>
    );
  }

  const svgContent = data;

  if (isError || !svgContent) {
    return (
      <span
        className={className}
        style={{
          width: `${paddedWidth}px`,
          height: `${paddedWidth}px`,
          padding,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <WarningOutlined />
      </span>
    );
  }

  return (
    <svg
      className={className}
      style={{ width: `${paddedWidth}px`, height: `${paddedWidth}px`, padding }}
      viewBox="0 0 512 512"
    >
      <use dangerouslySetInnerHTML={{ __html: svgContent }} xlinkHref={`#${spriteId}`} />
      <foreignObject height="100%" width="100%" x="0" y="0">
        {title && (
          <Tooltip title={title}>
            <div style={{ background: 'transparent', width: '100%', height: '100vh' }}></div>
          </Tooltip>
        )}
      </foreignObject>
    </svg>
  );
}
