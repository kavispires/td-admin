import { GridMapCellState, gridMapUtils } from './gridMap';

describe('gridMap', () => {
  describe('createGridMap', () => {
    it('should create a grid with the specified width and height', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);

      expect(grid.width).toBe(width);
      expect(grid.height).toBe(height);
      expect(grid.cells.length / width).toBe(height);
      expect(grid.cells.length / height).toBe(width);
    });

    it('should set the origin to the specified value or default to top-left', () => {
      const width = 5;
      const height = 5;
      const gridWithDefaultOrigin = gridMapUtils.createGridMap(width, height);
      const gridWithCustomOrigin = gridMapUtils.createGridMap(width, height, { origin: 'bottom-right' });

      expect(gridWithDefaultOrigin.origin).toBe('top-left');
      expect(gridWithCustomOrigin.origin).toBe('bottom-right');
    });

    it('should set the adjacency to the specified value or default to any', () => {
      const width = 5;
      const height = 5;
      const gridWithDefaultAvailability = gridMapUtils.createGridMap(width, height);
      const gridWithCustomAvailability = gridMapUtils.createGridMap(width, height, {
        adjacency: 'orthogonal',
      });

      expect(gridWithDefaultAvailability.adjacency).toBe('any');
      expect(gridWithCustomAvailability.adjacency).toBe('orthogonal');
    });

    it('should initialize cells with null data and the correct state based on adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });

      grid.cells.forEach((cell) => {
        expect(cell.data).toBeNull();
        expect(cell.state).toBe('unavailable');
      });
    });
    it('should initialize cells with default data and state if provided', () => {
      const width = 5;
      const height = 5;
      const defaultData = { data: 'default', state: 'locked' };
      const grid = gridMapUtils.createGridMap(width, height, { defaultData });

      grid.cells.forEach((cell) => {
        expect(cell.data).toBe('default');
        expect(cell.state).toBe('locked');
      });
    });
  });

  describe('getCellById', () => {
    it('should initialize specific cells with default data and state if provided as an array', () => {
      const width = 5;
      const height = 5;
      const defaultData = [
        { x: 1, y: 1, data: 'data1', state: 'used' },
        { x: 2, y: 2, data: 'data2', state: 'locked' },
      ];
      const grid = gridMapUtils.createGridMap(width, height, { defaultData });

      const cellIndex1 = 1 * width + 1;
      const cellIndex2 = 2 * width + 2;
      expect(grid.cells[cellIndex1].data).toBe('data1');
      expect(grid.cells[cellIndex1].state).toBe('used');
      expect(grid.cells[cellIndex2].data).toBe('data2');
      expect(grid.cells[cellIndex2].state).toBe('locked');
    });

    it('should retrieve the correct cell by its id', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = '2-3';
      const cell = gridMapUtils.getCellById(grid, cellId);

      expect(cell).not.toBeNull();
      expect(cell?.id).toBe(cellId);
      expect(cell?.x).toBe(2);
      expect(cell?.y).toBe(3);
    });

    it('should return null if the cell id does not exist', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = '10-10';
      const cell = gridMapUtils.getCellById(grid, cellId);

      expect(cell).toBeNull();
    });

    it('should return null if the cell id is malformed', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = 'invalid-id';
      const cell = gridMapUtils.getCellById(grid, cellId);

      expect(cell).toBeNull();
    });
  });

  describe('getCellByCoordinates', () => {
    it('should retrieve the correct cell by its coordinates', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const x = 2;
      const y = 3;
      const cell = gridMapUtils.getCellByCoordinates(grid, x, y);

      expect(cell).not.toBeNull();
      expect(cell?.x).toBe(x);
      expect(cell?.y).toBe(y);
    });

    it('should return null if the coordinates are out of bounds', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const x = 10;
      const y = 10;
      const cell = gridMapUtils.getCellByCoordinates(grid, x, y);

      expect(cell).toBeNull();
    });

    it('should return null if the coordinates are negative', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const x = -1;
      const y = -1;
      const cell = gridMapUtils.getCellByCoordinates(grid, x, y);

      expect(cell).toBeNull();
    });

    it('should return a cell with the correct data type', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap<number>(width, height);
      const x = 2;
      const y = 3;
      const cell = gridMapUtils.getCellByCoordinates(grid, x, y);

      expect(cell).not.toBeNull();
      expect(cell?.data).toBeNull();
    });
  });

  describe('getOrigin', () => {
    it('should return the top-left cell as the origin', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'top-left' });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(0);
      expect(originCell?.y).toBe(0);
    });

    it('should return the top-right cell as the origin', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'top-right' });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(width - 1);
      expect(originCell?.y).toBe(0);
    });

    it('should return the bottom-left cell as the origin', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'bottom-left' });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(0);
      expect(originCell?.y).toBe(height - 1);
    });

    it('should return the bottom-right cell as the origin', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'bottom-right' });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(width - 1);
      expect(originCell?.y).toBe(height - 1);
    });

    it('should return the center cell as the origin', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'center' });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(Math.floor(width / 2));
      expect(originCell?.y).toBe(Math.floor(height / 2));
    });

    it('should return the top-left cell as the default origin if an invalid origin is provided', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'invalid-origin' as any });
      const originCell = gridMapUtils.getOrigin(grid);

      expect(originCell).not.toBeNull();
      expect(originCell?.x).toBe(0);
      expect(originCell?.y).toBe(0);
    });
  });

  describe('getOriginId', () => {
    it('should return the id of the origin cell', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { origin: 'center' });
      const originId = gridMapUtils.getOriginId(grid);

      expect(originId).toBe('2-2');
    });

    it('should return return the top-left cell if the origin cell does not exist', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const originId = gridMapUtils.getOriginId(grid);

      expect(originId).toBe('0-0');
    });
  });

  describe('updateCell', () => {
    it('should update the cell data and state', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = '2-2';
      const newData = 'newData';
      const newState: GridMapCellState = 'used';

      const updatedGridMap = gridMapUtils.updateCell(grid, cellId, newData, newState);
      const updatedCell = gridMapUtils.getCellById(updatedGridMap, cellId);

      expect(updatedCell).not.toBeNull();
      expect(updatedCell?.data).toBe(newData);
      expect(updatedCell?.state).toBe(newState);
    });

    it('should clear the cell data and set state to available if newData is null', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = '2-2';
      const newData = null;

      const updatedGridMap = gridMapUtils.updateCell(grid, cellId, newData);
      const updatedCell = gridMapUtils.getCellById(updatedGridMap, cellId);

      expect(updatedCell).not.toBeNull();
      expect(updatedCell?.data).toBeNull();
      expect(updatedCell?.state).toBe('available');
    });

    it('should not change the state if the cell is locked', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, {
        defaultData: [{ x: 2, y: 2, data: 'data', state: 'locked' }],
      });
      const cellId = '2-2';
      const newData = 'newData';

      const updatedGridMap = gridMapUtils.updateCell(grid, cellId, newData);
      const updatedCell = gridMapUtils.getCellById(updatedGridMap, cellId);

      expect(updatedCell).not.toBeNull();
      expect(updatedCell?.data).toBe(newData);
      expect(updatedCell?.state).toBe('locked');
    });

    it('should update the states of surrounding cells based on grid adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });
      const cellId = '2-2';
      const newData = 'newData';

      const updatedGridMap = gridMapUtils.updateCell(grid, cellId, newData);
      const surroundingCells = [
        gridMapUtils.getCellByCoordinates(updatedGridMap, 2, 1),
        gridMapUtils.getCellByCoordinates(updatedGridMap, 2, 3),
        gridMapUtils.getCellByCoordinates(updatedGridMap, 1, 2),
        gridMapUtils.getCellByCoordinates(updatedGridMap, 3, 2),
      ];

      surroundingCells.forEach((cell) => {
        expect(cell?.state).toBe('available');
      });
    });

    it('should not update the cell if the id does not exist', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const cellId = '10-10';
      const newData = 'newData';

      const updatedGridMap = gridMapUtils.updateCell(grid, cellId, newData);
      const updatedCell = gridMapUtils.getCellById(updatedGridMap, cellId);

      expect(updatedCell).toBeNull();
    });
  });

  describe('getAllAdjacentCoordinates', () => {
    it('should return all coordinates for cells with any adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'any' });

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(grid);

      expect(availableCoordinates.length).toBe(width * height);
    });

    it('should return orthogonally adjacent coordinates for cells with orthogonal adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(grid, 'orthogonal');

      expect(availableCoordinates).toEqual(
        expect.arrayContaining([
          { x: 2, y: 1 },
          { x: 2, y: 3 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
        ]),
      );
    });

    it('should return diagonally adjacent coordinates for cells with diagonal adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'diagonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(grid, 'diagonal');

      expect(availableCoordinates).toEqual(
        expect.arrayContaining([
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
          { x: 3, y: 3 },
        ]),
      );
    });

    it('should return surrounding adjacent coordinates for cells with surrounding adjacency', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'surrounding' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(grid, 'surrounding');

      expect(availableCoordinates).toEqual(
        expect.arrayContaining([
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
        ]),
      );
    });

    it('should return an empty array if no cells match the criteria', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(grid, 'orthogonal', 'used');

      expect(availableCoordinates).toEqual([]);
    });

    it('should return coordinates of cells with the specified state', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'special');
      gridMapUtils.updateCell(grid, '1-2', 'data', 'used');
      gridMapUtils.updateCell(grid, '3-2', 'data', 'used');
      gridMapUtils.updateCell(grid, '2-1', 'data', 'used');

      const availableCoordinates = gridMapUtils.getAllAdjacentCoordinates(
        grid,
        'orthogonal',
        'available',
        'special',
      );

      expect(availableCoordinates).toEqual([{ x: 2, y: 3 }]);
    });
  });

  describe('getAdjacentIdsToCellId', () => {
    it('should return orthogonally adjacent cell ids', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '2-2', 'orthogonal');

      expect(adjacentIds).toEqual(expect.arrayContaining(['2-1', '2-3', '1-2', '3-2']));
    });

    it('should return diagonally adjacent cell ids', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'diagonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '2-2', 'diagonal');

      expect(adjacentIds).toEqual(expect.arrayContaining(['1-1', '3-1', '1-3', '3-3']));
    });

    it('should return surrounding adjacent cell ids', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'surrounding' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'used');

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '2-2', 'surrounding');

      expect(adjacentIds).toEqual(
        expect.arrayContaining(['1-1', '2-1', '3-1', '1-2', '3-2', '1-3', '2-3', '3-3']),
      );
    });

    it('should return an empty array if no adjacent cells match the criteria', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '2-2', 'orthogonal', 'used');

      expect(adjacentIds).toEqual([]);
    });

    it('should return adjacent cell ids with the specified state', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height, { adjacency: 'orthogonal' });
      gridMapUtils.updateCell(grid, '2-2', 'data', 'special');
      gridMapUtils.updateCell(grid, '1-2', 'data', 'used');
      gridMapUtils.updateCell(grid, '3-2', 'data', 'used');
      gridMapUtils.updateCell(grid, '2-1', 'data', 'used');

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '2-1', 'orthogonal', 'special');

      expect(adjacentIds).toEqual(['2-2']);
    });

    it('should return an empty array if the cell id does not exist', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);

      const adjacentIds = gridMapUtils.getAdjacentIdsToCellId(grid, '10-10', 'orthogonal');

      expect(adjacentIds).toEqual([]);
    });
  });

  describe('createPath', () => {
    it('should create a path of the specified length starting from the given cell', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const startId = '2-2';
      const length = 3;

      const pathResult = gridMapUtils.createPath(grid, length, startId);

      expect(pathResult).not.toBeNull();
      expect(pathResult?.path.length).toBe(length);
      expect(pathResult?.path[0]).toBe(startId);
    });

    it('should return null if the path cannot meet the specified length', () => {
      const width = 2;
      const height = 2;
      const grid = gridMapUtils.createGridMap(width, height);
      const startId = '0-0';
      const length = 5;

      const pathResult = gridMapUtils.createPath(grid, length, startId);

      expect(pathResult).toBeNull();
    });

    it.skip('should create a path that ends at the specified endId if provided', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const startId = '2-2';
      const endId = '4-4';
      const length = 5;

      const pathResult = gridMapUtils.createPath(grid, length, startId, { endId });

      expect(pathResult).not.toBeNull();
      expect(pathResult?.path.length).toBe(length);
      expect(pathResult?.path[pathResult.path.length - 1]).toBe(endId);
    });

    it('should not allow repetition of cells if allowRepetition is false', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const startId = '2-2';
      const length = 5;

      const pathResult = gridMapUtils.createPath(grid, length, startId, { allowRepetition: false });

      expect(pathResult).not.toBeNull();
      expect(pathResult?.path.length).toBe(length);
      const uniqueCells = new Set(pathResult?.path);
      expect(uniqueCells.size).toBe(length);
    });

    it('should return null if the startId does not exist', () => {
      const width = 5;
      const height = 5;
      const grid = gridMapUtils.createGridMap(width, height);
      const startId = '10-10';
      const length = 3;

      const pathResult = gridMapUtils.createPath(grid, length, startId);

      expect(pathResult).toBeNull();
    });
  });
});
