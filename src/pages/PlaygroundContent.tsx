import { Space } from 'antd';
import { useMemo } from 'react';
import { gridMapUtils } from '../toolKits/gridMap';

export function PlaygroundContent() {
  const grid = useMemo(() => {
    const g = gridMapUtils.createGridMap<string>(7, 7, { origin: 'center', adjacency: 'surrounding' });
    const originId = gridMapUtils.getOriginId(g);
    console.log({ originId });
    gridMapUtils.updateCell(g, originId ?? '', 'center');
    gridMapUtils.updateCell(g, '4-4', 'here');
    gridMapUtils.updateCell(g, '0-0', 'top', 'locked');
    console.log(g);
    return g;
  }, []);

  const getCellColor = (state: string) => {
    switch (state) {
      case 'available':
        return 'green';
      case 'unavailable':
        return 'red';
      case 'visited':
        return 'blue';
      case 'used':
        return 'yellow';
      default:
        return 'inherit';
    }
  };

  return (
    <Space direction="vertical">
      {grid.cells.map((cell, index) => (
        <div
          key={cell.id}
          style={{ width: 50, height: 50, border: '1px solid black', color: getCellColor(cell.state) }}
        >
          {cell.data ?? cell.id}
        </div>
      ))}
    </Space>
  );
}
