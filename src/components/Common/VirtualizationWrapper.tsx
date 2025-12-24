import { Skeleton } from 'antd';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type VirtualizationWrapperProps = {
  /**
   * Content to render when in viewport
   */
  children: ReactNode;
  /**
   * Width in pixels
   */
  width: number;
  /**
   * Height in pixels (optional if aspectRatio provided)
   */
  height?: number;
  /**
   * Aspect ratio in W:H format (e.g., "16:9", "4:3")
   */
  aspectRatio?: string;
};

/**
 * Wrapper component that virtualizes content by only rendering children when in viewport
 * Shows a skeleton placeholder when content is outside the viewport
 */
export function VirtualizationWrapper({ children, width, height, aspectRatio }: VirtualizationWrapperProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate height from aspectRatio if height not provided
  const calculatedHeight = height ?? calculateHeightFromAspectRatio(width, aspectRatio);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Calculate the margin based on half the height
    const rootMargin = `${calculatedHeight / 2 || 300}px 0px`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin,
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [calculatedHeight]);

  return (
    <div ref={containerRef} style={{ width: `${width}px`, height: `${calculatedHeight}px` }}>
      {isInView ? (
        children
      ) : (
        <Skeleton.Image active style={{ width: `${width}px`, height: `${calculatedHeight}px` }} />
      )}
    </div>
  );
}

/**
 * Calculate height from aspect ratio string (e.g., "16:9")
 */
function calculateHeightFromAspectRatio(width: number, aspectRatio?: string): number {
  if (!aspectRatio) {
    // Default aspect ratio if none provided
    return width;
  }

  const [w, h] = aspectRatio.split(':').map(Number);

  if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) {
    console.warn(`Invalid aspect ratio format: ${aspectRatio}. Expected format: "W:H"`);
    return width;
  }

  return (width * h) / w;
}
