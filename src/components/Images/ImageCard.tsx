// Ant Design Resources
import { Image, type ImageProps } from 'antd';
import clsx from 'clsx';

// Hooks
import { useBaseUrl } from 'hooks/useBaseUrl';

export type ImageCardProps = {
  /**
   * The id of the image
   */
  id: string;
  /**
   * The width of the card (Default: 200px)
   */
  width?: number;
  /**
   * Optional custom class name
   */
  className?: string;
  /**
   * Enables or disables the preview (default: true)
   */
  preview?: ImageProps['preview'];
  /**
   * The file extension for the image (default: jpg)
   */
  fileExtension?: 'jpg' | 'png' | 'gif';
};

/**
 * Renders an Image Card on tdi
 */
export const ImageCard = ({
  id,
  width = 200,
  className = '',
  preview = true,
  fileExtension = 'jpg',
}: ImageCardProps) => {
  const { getUrl } = useBaseUrl('images');
  const imageURL = id.replace(/-/g, '/');

  return (
    <div className={clsx('image-card', className)}>
      <Image
        fallback={getUrl('back/default.jpg')}
        preview={preview}
        src={getUrl(`${imageURL}.${fileExtension}`)}
        width={width}
      />
    </div>
  );
};
