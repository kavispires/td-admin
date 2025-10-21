import { WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Spin, Tooltip } from 'antd';
import { useBaseUrl } from 'hooks/useBaseUrl';
import { useEffect, useRef } from 'react';

export const DEFAULT_SPRITE_SIZE = 72;
export const DEFAULT_PADDING = 6;

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
export function Sprite({
  spriteId,
  source,
  width = DEFAULT_SPRITE_SIZE,
  padding = DEFAULT_PADDING,
  title,
  className,
}: SpriteProps) {
  const { getUrl } = useBaseUrl('sprites');

  const { isLoading, data, isError } = useQuery({
    queryKey: ['sprite', source],
    queryFn: async () => {
      const response = await fetch(`${getUrl('sprites')}/${source}.svg`);
      return await response.text();
    },
    enabled: !!spriteId && !!source,
  });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const paddedWidth = width - 12;
  const svgContent = data;

  // Insert the SVG sprite sheet into a hidden container
  useEffect(() => {
    if (svgContent && svgContainerRef.current) {
      // Clear any existing content
      svgContainerRef.current.innerHTML = '';

      // Create a temporary container to parse the SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgContent;

      // Find the SVG element and append it to our container
      const svgElement = tempDiv.querySelector('svg');
      if (svgElement) {
        // Ensure the SVG has an ID for referencing
        if (!svgElement.id) {
          svgElement.id = `sprite-sheet-${source}`;
        }
        svgContainerRef.current.appendChild(svgElement);
      }
    }
  }, [svgContent, source]);

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
    <>
      {/* Hidden container for the sprite sheet */}
      <div ref={svgContainerRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />

      <svg
        className={className}
        style={{ width: `${paddedWidth}px`, height: `${paddedWidth}px`, padding }}
        viewBox="0 0 512 512"
      >
        <use href={`#${spriteId}`} />
        <foreignObject height="100%" width="100%" x="0" y="0">
          {title && (
            <Tooltip title={title}>
              <div style={{ background: 'transparent', width: '100%', height: '100vh' }}></div>
            </Tooltip>
          )}
        </foreignObject>
      </svg>
    </>
  );
}
