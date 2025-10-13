import { EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tooltip } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useWindowSize } from 'react-use';
import escapeRoomSprite from './escape-room-sprites.svg?url';
import './cards.styles.scss';
import { ModalOverlay } from 'components/FromTD/ModalOverlay';
import { Translate } from 'components/FromTD/Translate';
import { AlienSign as SignSprite } from 'components/Sprites/AlienSign';
import { Emoji as EmojiSprite } from 'components/Sprites/Emoji';
import { Glyph as GlyphSprite } from 'components/Sprites/Glyph';
import { Item as ItemSprite } from 'components/Sprites/Item';
import { WarehouseGood as WarehouseGoodSprite } from 'components/Sprites/WarehouseGood';
import { useBaseUrl as useTDBaseUrl } from 'hooks/useBaseUrl';
import type { Align, BoxVariant, Size } from './escape-room-types';

export function Markdown({ children, className = '' }: { children?: string; className?: string }) {
  return (
    <div className={clsx('er-markdown', className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

type ERSpriteProps = {
  spriteId: string;
  /**
   * In `em`
   */
  width?: number;
} & React.SVGProps<SVGSVGElement>;
export function ERSprite({ spriteId, width, ...props }: ERSpriteProps) {
  return (
    <svg height={`${width}em`} viewBox="0 0 512 512" width={`${width}em`} {...props}>
      <use href={`${escapeRoomSprite}#${spriteId}`}></use>
    </svg>
  );
}

const BACKGROUNDS: Record<string, string> = {
  default: 'er/backgrounds/default.jpg',
  defaultBlack: 'er/backgrounds/defaultBlack.jpg',
  abstractBlue: 'er/backgrounds/abstractBlue.jpg',
  digit: 'er/backgrounds/digit.jpg',
  messy: 'er/backgrounds/messy.jpg',
  metalDoor: 'er/backgrounds/metalDoor.jpg',
  shattered: 'er/backgrounds/shattered.jpg',
  space: 'er/backgrounds/space.jpg',
  zoomBlue: 'er/backgrounds/zoomBlue.jpg',
  zoomGrey: 'er/backgrounds/zoomGrey.jpg',
  zoomPink: 'er/backgrounds/zoomPink.jpg',
  zoomRed: 'er/backgrounds/zoomRed.jpg',
  zoomYellow: 'er/backgrounds/zoomYellow.jpg',
};

type CardProps = {
  cardId: string;
  width: number;
  background?: string;
  children: React.ReactNode;
  unplayable?: boolean;
  onPlayCard?: (cardId: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  width,
  background = 'default',
  style,
  onPlayCard,
  unplayable,
  cardId,
  ...props
}: CardProps) {
  const [open, setOpen] = useState(false);

  const { getUrl } = useTDBaseUrl('images');
  // Use custom background or default one
  const backgroundImage = BACKGROUNDS?.[background] ?? background ?? BACKGROUNDS.default;
  const height = width * 1.5;
  const { height: windowHeight } = useWindowSize();

  const scale = (windowHeight * 0.85) / height;

  // biome-ignore lint/correctness/noNestedComponentDefinitions: TODO: Figure this out
  const Component = ({ s }: { s: number }) => (
    <div
      className={clsx('er-card', `er-card--${background}`)}
      style={{
        fontSize: width / 20,
        width: width,
        height: 1.5 * width,
        backgroundImage: `url(${getUrl(backgroundImage)})`,
        padding: width / 20,
        transform: `scale(${s})`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );

  return (
    <div>
      <ModalOverlay onClose={() => setOpen(false)} open={open}>
        <Component s={scale} />
      </ModalOverlay>

      <div className="er-card-container">
        <Space.Compact size="small" style={{ width: '100%' }}>
          <Button aria-label="View card" block onClick={() => setOpen(true)} title="View card">
            <EyeOutlined />
          </Button>
          {!unplayable && (
            <Tooltip title={<Translate en="Play card" pt="Usar card" />}>
              <Popconfirm
                onConfirm={() => onPlayCard?.(cardId)}
                title={<Translate en="Do you want to play this card?" pt="Deseja usar esta carta?" />}
              >
                <Button block className="er-card-play-button" disabled={!onPlayCard}>
                  <ERSprite spriteId="play-card" width={1} />
                </Button>
              </Popconfirm>
            </Tooltip>
          )}
        </Space.Compact>

        <Component s={1} />
      </div>
    </div>
  );
}

type SpriteProps = {
  library: string;
  spriteId: string;
  scale?: number;
  rotate?: number;
  width?: number;
  className?: string;
};
export function Sprite({ library, spriteId, scale = 1, rotate = 0, width = 10, className }: SpriteProps) {
  const style = { transform: `rotate(${rotate}deg) scale(${scale})` };

  switch (library) {
    case 'alien-signs':
      return <SignSprite className={className} signId={spriteId} style={style} width={width} />;
    case 'emojis':
      return <EmojiSprite className={className} emojiId={spriteId} style={style} width={width} />;
    case 'glyphs':
      return <GlyphSprite className={className} glyphId={spriteId} style={style} width={width} />;
    case 'items':
      return <ItemSprite className={className} itemId={spriteId} style={style} width={width} />;
    case 'warehouse-goods':
      return <WarehouseGoodSprite className={className} goodId={spriteId} style={style} width={width} />;
    default:
      return <WarningOutlined style={{ color: 'red' }} />;
  }
}

type ImageCoverProps = {
  id: string;
  width: number;
} & ElementProps;
export function ImageCover({ id, width, children, className }: ImageCoverProps) {
  const baseUrl = useTDBaseUrl('images');
  const cardId = id.replace(/-/g, '/');
  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${width * 1.5}px`,
        backgroundImage: `url(${baseUrl}/${cardId}.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  );
}

type BasicBlockProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

type HeaderProps = BasicBlockProps & {
  spriteId?: string;
  contained?: boolean;
};
export function Header({ children, spriteId, contained, ...props }: HeaderProps) {
  return (
    <div className={clsx('er-card-header', contained && 'er-card-header--contained')} {...props}>
      {spriteId && <ERSprite spriteId={spriteId} width={2} />}
      <h2>{children}</h2>
    </div>
  );
}

type ContentProps = BasicBlockProps & {
  center?: boolean;
  rows?: boolean;
  quadrants?: boolean;
};

export function Content({ children, center, rows, quadrants, ...props }: ContentProps) {
  return (
    <div
      className={clsx('er-card-content', {
        'er-card-content--center': center,
        'er-card-content--rows': rows,
        'er-card-content--quadrants': quadrants,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ContentBox positioning props for grid layouts
 */
type ContentBoxProps = BasicBlockProps & {
  /** Position in 5-row grid (1-5). Use with Content rows prop */
  row?: 1 | 2 | 3 | 4 | 5;
  /** Position in 2x2 quadrant grid (1-4). Use with Content quadrants prop */
  quadrant?: 1 | 2 | 3 | 4;
  /** For rows only - span multiple rows vertically (1-5). Example: row={2} span={3} spans rows 2,3,4 */
  span?: 1 | 2 | 3 | 4 | 5;
};

/**
 * ContentBox component for positioning content within grid layouts
 *
 * Usage examples:
 *
 * For 5-row grid (use with <Content rows>):
 * - <ContentBox row={1}>Title</ContentBox> - Places content in row 1
 * - <ContentBox row={2} span={2}>Big content</ContentBox> - Spans rows 2 and 3
 * - <ContentBox row={3} span={3}>Huge content</ContentBox> - Spans rows 3, 4, and 5
 *
 * For 2x2 quadrant grid (use with <Content quadrants>):
 * - <ContentBox quadrant={1}>Top Left</ContentBox>
 * - <ContentBox quadrant={2}>Top Right</ContentBox>
 * - <ContentBox quadrant={3}>Bottom Left</ContentBox>
 * - <ContentBox quadrant={4}>Bottom Right</ContentBox>
 *
 * Note: span only works with row positioning, not quadrants
 */
export function ContentBox({ children, className, row, quadrant, span, style, ...props }: ContentBoxProps) {
  // Calculate grid positioning based on props using useMemo for performance
  const gridStyle = useMemo((): React.CSSProperties => {
    if (row) {
      // For row positioning (5-row grid)
      if (span && span > 1) {
        // Spanning multiple rows
        return {
          gridRow: `${row} / ${row + span}`,
          gridColumn: '1 / -1', // Span full width
        };
      }
      // Single row
      return {
        gridRow: row.toString(),
        gridColumn: '1 / -1', // Full width of the row
      };
    }

    if (quadrant) {
      // For quadrant positioning (2x2 grid)
      switch (quadrant) {
        case 1:
          return { gridRow: '1', gridColumn: '1' };
        case 2:
          return { gridRow: '1', gridColumn: '2' };
        case 3:
          return { gridRow: '2', gridColumn: '1' };
        case 4:
          return { gridRow: '2', gridColumn: '2' };
        default:
          return {};
      }
    }

    return {};
  }, [row, quadrant, span]);

  return (
    <div
      className={clsx('er-content-box', className)}
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...gridStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CenterBox({ children, ...props }: BasicBlockProps) {
  return (
    <div className="er-center-box" {...props}>
      {children}
    </div>
  );
}

export function Empty({ size = 1, className, ...props }: ElementProps & { size?: number }) {
  return <div className={clsx('er-empty', `er-empty-${size}`, className)} {...props} />;
}

export function getBoxClasses(
  prefix: string,
  { size, align, variant }: { size?: Size; align?: Align; variant?: BoxVariant },
) {
  return clsx(
    size && `er-${prefix}--${size}`,
    align && `er-${prefix}--${align}`,
    variant && `er-${prefix}--${variant}`,
  );
}

type TextContentProps = BasicBlockProps & {
  size?: Size;
  align?: Align;
  variant?: BoxVariant;
  color?: string;
};

export function Title({ children, size, align, variant, className, color, ...props }: TextContentProps) {
  return (
    <h3
      className={clsx('er-title', getBoxClasses('box', { size, align, variant }), className)}
      {...props}
      style={{ color, ...props.style }}
    >
      {children}
    </h3>
  );
}

export function Subtitle({ children, size, align, variant, className, color, ...props }: TextContentProps) {
  return (
    <h3
      className={clsx('er-subtitle', getBoxClasses('box', { size, align, variant }), className)}
      {...props}
      style={{ color, ...props.style }}
    >
      {children}
    </h3>
  );
}

export function Label({ children, size, align, variant, className, color, ...props }: TextContentProps) {
  return (
    <div
      className={clsx('er-label', getBoxClasses('box', { size, align, variant }), className)}
      {...props}
      style={{ color, ...props.style }}
    >
      {children}
    </div>
  );
}

export function TextBox({
  children,
  size,
  align,
  variant,
  className,
  ...props
}: Omit<TextContentProps, 'children'> & { children?: string }) {
  if (!children) return null;
  return (
    <Markdown
      className={clsx('er-text-box', getBoxClasses('box', { size, align, variant }), className)}
      {...props}
    >
      {children}
    </Markdown>
  );
}
