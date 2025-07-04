/**
 * Builds paths from canvas lines
 * @param lines
 * @returns
 */
const getPathFromKonvaLines = (lines: number[][]) => {
  const result = lines.map((lineArr) => {
    let path = '';
    for (let x = 0, y = 1; y < lineArr.length; x += 2, y += 2) {
      if (lineArr[x + 2] && lineArr[y + 2]) {
        path += `M${lineArr[x]},${lineArr[y]} L${lineArr[x + 2]},${lineArr[y + 2]}`;
      }
    }

    return path;
  });

  return result;
};

type CanvasSVGProps = {
  /**
   * The stringified svg path
   */
  drawing: string;
  /**
   * Optional custom class name
   */
  className?: string;
  /**
   * The width of the canvas (default: 500)
   */
  width?: number;
  /**
   * The height of the canvas (default: 500)
   */
  height?: number;
  /**
   * Size of the stroke. Default: medium
   */
  strokeWidth?: 'small' | 'medium' | 'large';
  /**
   * Custom view box size (default: '0 0 500')
   */
  viewBox?: string;
};

export const CanvasSVG = ({
  drawing = '',
  className = '',
  width = 250,
  height,
  strokeWidth = 'medium',
  viewBox = '0 0 500 500',
}: CanvasSVGProps) => {
  const konvaLines = JSON.parse(drawing);
  const paths = getPathFromKonvaLines(konvaLines);

  const strokeWidthBySize =
    {
      small: 3,
      medium: 5,
      large: 7,
    }?.[strokeWidth] ?? 5;

  return (
    <svg
      className={className}
      overflow="hidden"
      style={{ width: `${width}px`, height: `${height || width}px` }}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      {paths.map((path, index) => (
        <path
          d={path}
          fill="none"
          key={`${drawing}-${index}`}
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth={strokeWidthBySize}
        />
      ))}
    </svg>
  );
};
