// Hooks
import { useBaseUrl } from '@hooks/useBaseUrl';
import clsx from 'clsx';
import type { ReactNode } from 'react';
// Sass
import styles from './DynamicCard.module.scss';

export type DynamicCardSpanItemProps = {
  /** The content to render inside the span */
  children: ReactNode;

  // --- POSITIONING ---
  /** Distance from the top edge (use % or cqw units) */
  top?: string | number;
  /** Distance from the bottom edge (use % or cqw units) */
  bottom?: string | number;
  /** Distance from the left edge (use % or cqw units) */
  left?: string | number;
  /** Distance from the right edge (use % or cqw units) */
  right?: string | number;
  /** Automatically centers the item horizontally (left: 50%, translateX(-50%)) */
  centerHorizontal?: boolean;
  /** Automatically centers the item vertically (top: 50%, translateY(-50%)) */
  centerVertical?: boolean;

  // --- PROPORTIONAL SCALING (cqw targets) ---
  /** Width of the item (highly recommended to use cqw units for responsive scaling) */
  width?: string | number;
  /** Font size (use cqw units for responsive text scaling) */
  fontSize?: string | number;
  /** Aspect ratio (e.g., "1 / 1" for a perfect square or "16 / 9") */
  aspectRatio?: string | number;
  /** Border radius (use cqw units for responsive curves, or px for fixed) */
  borderRadius?: string | number;
  /** Padding inside the span (use cqw units for proportional spacing) */
  padding?: string | number;
  /** Border width (use cqw units for scalable borders around badges) */
  borderWidth?: string | number;

  // --- STANDARD OVERRIDES ---
  /** Optional custom className */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
};

/**
 * Positions elements absolutely within a DynamicCard using container query units (cqw)
 */
export function DynamicCardSpanItem({
  children,
  top,
  bottom,
  left,
  right,
  centerHorizontal,
  centerVertical,
  width,
  fontSize,
  aspectRatio,
  borderRadius,
  padding,
  borderWidth,
  className,
  style,
}: DynamicCardSpanItemProps) {
  return (
    <span
      className={clsx(styles.dynamicCardItem, className)}
      style={{
        top: top ?? (centerVertical ? '50%' : undefined),
        bottom,
        left: left ?? (centerHorizontal ? '50%' : undefined),
        right,
        width,
        fontSize,
        aspectRatio,
        borderRadius,
        padding,
        borderWidth,
        translate:
          centerHorizontal || centerVertical
            ? `${centerHorizontal ? '-50%' : '0'} ${centerVertical ? '-50%' : '0'}`
            : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ==========================================
// 2. DYNAMIC CARD BASE
// ==========================================

export type DynamicCardProps = {
  /**
   * The base width of the card in pixels (height is calculated automatically via aspectRatio)
   */
  width: number;
  /**
   * The unique ID of the background image to fetch from TD assets
   */
  backgroundImageId: string;
  /**
   * Optional content to render inside the card
   */
  children?: ReactNode;
  /**
   * The height-to-width ratio (defaults to 1.5 for standard playing card ratio)
   */
  aspectRatio?: number;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Container-query-enabled wrapper for rendering game cards with responsive scaling
 * To enable preview, use it with general / ComponentPreview
 */
export function DynamicCard({
  width,
  backgroundImageId,
  children,
  aspectRatio = 1.5,
  className,
  style,
  ...rest
}: DynamicCardProps) {
  const { getUrl } = useBaseUrl('images');

  if (!backgroundImageId) {
    return null;
  }

  const imagePath = backgroundImageId.replace(/-/g, '/');

  return (
    <div
      className={clsx(styles.dynamicCard, className)}
      style={{
        width: `${width}px`,
        height: `${width * aspectRatio}px`,
        backgroundImage: `url(${getUrl(imagePath)}.jpg)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Attach the Span to the Card for clean imports
DynamicCard.Span = DynamicCardSpanItem;
