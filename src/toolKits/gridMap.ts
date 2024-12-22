import { flatten, sample } from 'lodash';

export type GridMapOrigin = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export type GridMapCellState = 'available' | 'used' | 'locked' | 'unavailable' | string;
export type GridMapAdjacency = 'any' | 'orthogonal' | 'diagonal' | 'surrounding';

/**
 * TD GRID MAP TOOLKIT FUNCTIONS
 * Version 1.0.0
 */

/**
 * Represents a cell in a grid with optional coordinates and state.
 */
export type SeedCell<TCellData> = {
  /**
   * The x-coordinate of the cell
   */
  x?: number;
  /**
   * The y-coordinate of the cell
   */
  y?: number;
  /**
   * The data contained in the cell
   */
  data: TCellData | null;
  /**
   * The state of the cell
   */
  state?: GridMapCellState;
};

export type GridMapCellType<TCellData> = {
  /**
   * The unique identifier of the cell composed of its x and y coordinates
   */
  id: string;
  /**
   * The x-coordinate of the cell
   */
  x: number;
  /**
   * The y-coordinate of the cell
   */
  y: number;
  /**
   * The data contained in the cell
   */
  data: TCellData | null;
  /**
   * The state of the cell (it accepts an arbitrary string for custom states)
   */
  state: GridMapCellState;
};

export type GridMapType<TCellData> = {
  /**
   * The width of the grid
   */
  width: number;
  /**
   * The height of the grid
   **/
  height: number;
  /**
   * The origin of the grid
   **/
  origin: GridMapOrigin;
  /**
   * The cells of the grid
   **/
  cells: GridMapCellType<TCellData | null>[];
  /**
   * The adjacency of the grid
   * - 'any': any empty cell is available
   * - 'surrounding': only cells surrounding used cells are available
   * - 'orthogonal': only cells orthogonally adjacent to used cells are available
   * - 'diagonal': only cells diagonally adjacent to used cells are available
   **/
  adjacency: GridMapAdjacency;
};

export type GridMapOptions<TCellData> = {
  /**
   * The origin of the grid
   */
  origin?: GridMapOrigin;
  /**
   * The default data to populate the grid with
   */
  defaultData?: SeedCell<TCellData> | SeedCell<TCellData>[];
  /**
   * The adjacency of the grid
   */
  adjacency?: GridMapAdjacency;
};

/**
 * Creates a grid with specified width and height, and initializes cells with optional data and state.
 * @template TCellData - The type of data stored in each cell.
 * @param width - The number of columns in the grid.
 * @param height - The number of rows in the grid.
 * @param [options={}] - Optional configuration for the grid.
 * @param [options.origin='top-left'] - The origin point of the grid.
 * @param [options.adjacency='any'] - The initial adjacency state of the cells.
 * @param [options.defaultData] - Default data to initialize the cells.
 * @returns The created grid object.
 */
function createGridMap<TCellData>(
  width: number,
  height: number,
  options: GridMapOptions<TCellData> = {},
): GridMapType<TCellData> {
  const origin = options.origin || 'top-left';
  const adjacency = options.adjacency || 'any';

  // Create a flattened array of cells
  const cells: GridMapCellType<TCellData>[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        id: composeCellId(x, y),
        x,
        y,
        data: null,
        state: adjacency === 'any' ? 'available' : 'unavailable',
      });
    }
  }

  // Apply default data to specific cells if provided
  const defaultData = options.defaultData;
  if (defaultData && Array.isArray(defaultData)) {
    defaultData.forEach(({ x, y, data, state }) => {
      const cell = cells.find((cell) => cell.x === x && cell.y === y);
      if (cell) {
        cell.data = data;
        cell.state = state || 'used';
      }
    });
  } else if (defaultData) {
    cells.forEach((cell) => {
      cell.data = defaultData.data;
      cell.state = defaultData.state || 'used';
    });
  }

  return { width, height, origin, cells, adjacency };
}

/**
 * Composes a unique identifier for a cell based on its x and y coordinates.
 * @param x - The x-coordinate of the cell.
 * @param y - The y-coordinate of the cell.
 * @returns The unique identifier of the cell.
 */
function composeCellId(x: number, y: number): string {
  return `${x}-${y}`;
}

/**
 * Parses a cell identifier into its x and y coordinates.
 * @param id - The unique identifier of the cell.
 * @returns An object containing the x and y coordinates of the cell.
 */
function parseCellId(id: string): { x: number; y: number } {
  const [x, y] = id.split('-').map(Number);
  return { x, y };
}

/**
 * Retrieves the index of a cell in the grid based on its x and y coordinates.
 * @param grid - The grid containing the cell.
 * @param x - The x-coordinate of the cell.
 * @param y - The y-coordinate of the cell.
 * @returns The index of the cell in the grid.
 */
function getCellIndex<TCellData = unknown>(grid: GridMapType<TCellData>, x: number, y: number): number {
  return grid.width * y + x;
}

/**
 * Retrieves a cell from the grid based on the provided x and y coordinates.
 *
 * @template TCellData - The type of data stored in the cell.
 * @param grid - The grid from which to retrieve the cell.
 * @param x - The x-coordinate of the cell.
 * @param y - The y-coordinate of the cell.
 * @returns {GridMapCellType<TCellData> | null} - The cell at the specified coordinates, or null if no cell exists at those coordinates.
 */
function getCellByCoordinates<TCellData>(
  grid: GridMapType<TCellData>,
  x: number,
  y: number,
): GridMapCellType<TCellData | null> | null {
  return grid.cells.find((cell) => cell.x === x && cell.y === y) || null;
}

/**
 * Retrieves a cell from the grid using its unique identifier.
 *
 * @template TCellData - The type of data stored in the cell.
 * @param grid - The grid from which to retrieve the cell.
 * @param id - The unique identifier of the cell, formatted as "x-y".
 * @returns {GridMapCellType<TCellData> | null} - The cell corresponding to the given id, or null if no such cell exists.
 */
function getCellById<TCellData>(
  grid: GridMapType<TCellData>,
  id: string,
): GridMapCellType<TCellData | null> | null {
  return grid.cells.find((cell) => cell.id === id) || null;
}

/**
 * Retrieves the origin cell of the grid based on the specified origin point.
 */
function getOrigin<TCellData>(grid: GridMapType<TCellData>): GridMapCellType<TCellData | null> | null {
  const { width, height, origin } = grid;

  let originX: number;
  let originY: number;

  switch (origin) {
    case 'top-left':
      originX = 0;
      originY = 0;
      break;
    case 'top-right':
      originX = width - 1;
      originY = 0;
      break;
    case 'bottom-left':
      originX = 0;
      originY = height - 1;
      break;
    case 'bottom-right':
      originX = width - 1;
      originY = height - 1;
      break;
    case 'center':
      originX = Math.floor(width / 2);
      originY = Math.floor(height / 2);
      break;
    default:
      originX = 0;
      originY = 0;
  }

  return getCellByCoordinates(grid, originX, originY);
}

/**
 * Retrieves the unique identifier of the origin cell in the grid.
 */
function getOriginId<TCellData>(grid: GridMapType<TCellData>): string | null {
  const origin = getOrigin(grid);
  return origin ? origin.id : null;
}

/**
 * Retrieves the coordinates of available cells in a grid based on the specified adjacency criteria.
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid to search for available cells.
 * @param [adjacency] - The adjacency criteria for selecting cells.
 *   - 'any': Selects any available cell.
 *   - 'orthogonal': Selects cells that are orthogonally adjacent to used cells.
 *   - 'diagonal': Selects cells that are diagonally adjacent to used cells.
 *  - 'surrounding': Selects cells that are surrounding used cells.
 * @param cellState - The state of the cells to search for.
 * @param [adjacentCellState='used'] - The state of the adjacent cells to check against.
 * @returns An array of coordinates of the available cells.
 */
function getAllAdjacentCoordinates<TCellData>(
  grid: GridMapType<TCellData>,
  adjacency?: GridMapAdjacency,
  cellState?: GridMapCellState,
  adjacentCellState: GridMapCellState = 'used',
): { x: number; y: number }[] {
  const availableCells: { x: number; y: number }[] = [];
  const chosenAdjacency = adjacency || grid.adjacency;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = getCellByCoordinates(grid, x, y);

      if (cell && (cellState ? cell.state === cellState : true) && cell.data === null) {
        if (chosenAdjacency === 'any') {
          availableCells.push({ x, y });
        } else if (
          chosenAdjacency === 'surrounding' &&
          _isSurroundingAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push({ x, y });
        } else if (
          chosenAdjacency === 'orthogonal' &&
          _isOrthogonallyAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push({ x, y });
        } else if (
          chosenAdjacency === 'diagonal' &&
          _isDiagonallyAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push({ x, y });
        }
      }
    }
  }

  return availableCells;
}

/**
 * Retrieves the ids of cells in a grid based on the specified adjacency criteria.
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid to search for available cells.
 * @param [adjacency] - The adjacency criteria for selecting cells.
 *   - 'any': Selects any available cell.
 *   - 'orthogonal': Selects cells that are orthogonally adjacent to used cells.
 *   - 'diagonal': Selects cells that are diagonally adjacent to used cells.
 *  - 'surrounding': Selects cells that are surrounding used cells.
 * @param [cellState='available'] - The state of the cells to search for.
 * @param [adjacentCellState='used'] - The state of the adjacent cells to check against.
 * @returns An array of ids of the cells.
 */
function getAllAdjacentIds(
  grid: GridMapType<unknown>,
  adjacency?: GridMapAdjacency,
  cellState?: GridMapCellState,
  adjacentCellState: GridMapCellState = 'used',
): string[] {
  const availableCells: string[] = [];
  const chosenAdjacency = adjacency || grid.adjacency;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = getCellByCoordinates(grid, x, y);

      if (cell && (cellState ? cell.state === cellState : true) && cell.data === null) {
        if (chosenAdjacency === 'any') {
          availableCells.push(cell.id);
        } else if (
          chosenAdjacency === 'surrounding' &&
          _isSurroundingAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push(cell.id);
        } else if (
          chosenAdjacency === 'orthogonal' &&
          _isOrthogonallyAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push(cell.id);
        } else if (
          chosenAdjacency === 'diagonal' &&
          _isDiagonallyAdjacentToUsed(grid, x, y, adjacentCellState)
        ) {
          availableCells.push(cell.id);
        }
      }
    }
  }

  return availableCells;
}

const ORTHOGONAL_OFFSETS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];
const DIAGONAL_OFFSETS = [
  { dx: -1, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: 1 },
];
const SURROUNDING_OFFSETS = [
  { dx: -1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
];

const OFFSETS = {
  orthogonal: ORTHOGONAL_OFFSETS,
  diagonal: DIAGONAL_OFFSETS,
  surrounding: SURROUNDING_OFFSETS,
  any: SURROUNDING_OFFSETS,
};

/**
 * Retrieves the available cell IDs from the grid based on the specified adjacency.
 *
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid map containing cell data.
 * @param [adjacency] - Optional parameter specifying the adjacency rules for determining available cells.
 * @returns An array of available cell IDs.
 */
function _isOrthogonallyAdjacentToUsed<TCellData>(
  grid: GridMapType<TCellData>,
  x: number,
  y: number,
  cellState: GridMapCellState,
): boolean {
  return ORTHOGONAL_OFFSETS.some(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    return _isWithinBounds(grid, nx, ny) && getCellByCoordinates(grid, nx, ny)?.state === cellState;
  });
}

/**
 * Checks if a cell in the grid is diagonally adjacent to any cell that is marked as 'used'.
 *
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid to check within.
 * @param x - The x-coordinate of the cell to check.
 * @param y - The y-coordinate of the cell to check.
 * @returns - Returns true if the cell is diagonally adjacent to a 'used' cell, otherwise false.
 */
function _isDiagonallyAdjacentToUsed<TCellData>(
  grid: GridMapType<TCellData>,
  x: number,
  y: number,
  cellState: GridMapCellState,
): boolean {
  return DIAGONAL_OFFSETS.some(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    return _isWithinBounds(grid, nx, ny) && getCellByCoordinates(grid, nx, ny)?.state === cellState;
  });
}

function _isSurroundingAdjacentToUsed<TCellData>(
  grid: GridMapType<TCellData>,
  x: number,
  y: number,
  cellState: GridMapCellState = 'used',
): boolean {
  return SURROUNDING_OFFSETS.some(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    return _isWithinBounds(grid, nx, ny) && getCellByCoordinates(grid, nx, ny)?.state === cellState;
  });
}

/**
 * Checks if the given coordinates (x, y) are within the bounds of the grid.
 *
 * @template TCellData - The type of data stored in the grid cells.
 * @param grid - The grid to check the bounds against.
 * @param x - The x-coordinate to check.
 * @param y - The y-coordinate to check.
 * @returns - Returns `true` if the coordinates are within the bounds of the grid, otherwise `false`.
 */
function _isWithinBounds<TCellData>(grid: GridMapType<TCellData>, x: number, y: number): boolean {
  return x >= 0 && x < grid.width && y >= 0 && y < grid.height;
}

/**
 * Retrieves all empty cells from the given grid.
 *
 * @template TCellData - The type of data stored in the grid cells.
 * @param grid - The grid from which to retrieve empty cells.
 * @returns An array of cells that contain null data.
 */
function getEmptyCells<TCellData>(grid: GridMapType<TCellData>): GridMapCellType<TCellData | null>[] {
  return flatten(grid.cells).filter((cell): cell is GridMapCellType<TCellData | null> => cell.data === null);
}

/**
 * Updates the data and state of a specific cell in the grid.
 *
 * @template TCellData - The type of data stored in the cell.
 * @param grid - The grid containing the cell to be updated.
 * @param id - The unique identifier of the cell to be updated.
 * @param newData - The new data to be set in the cell. If null, the cell's data will be cleared.
 * @param [state] - The new state to be set for the cell. If not provided, defaults to 'available' if newData is null, otherwise 'used'.
 * @returns - The updated grid.
 */
function updateCell<TCellData>(
  grid: GridMapType<TCellData>,
  id: string,
  newData: TCellData | null,
  state?: GridMapCellState,
): GridMapType<TCellData> {
  const cell = getCellById(grid, id);

  if (cell) {
    // Update the cell's data and state
    if (newData === null) {
      cell.data = null;
      cell.state = state || 'available';
    } else {
      cell.data = newData;
      cell.state = cell.state === 'locked' ? 'locked' : state || 'used';
    }

    // Update surrounding cells based on grid adjacency
    _updateSurroundingCells(grid, cell.x, cell.y);
  }

  return grid;
}

function _updateSurroundingCells<TCellData>(grid: GridMapType<TCellData>, x: number, y: number) {
  const adjacency = grid.adjacency;

  const updateIfEmpty = (nx: number, ny: number) => {
    const cell = getCellByCoordinates(grid, nx, ny);
    if (cell && cell.data === null && cell.state !== 'locked') {
      cell.state = 'available';
    }
  };

  const offsets = OFFSETS[adjacency];
  offsets.forEach(({ dx, dy }) => updateIfEmpty(x + dx, y + dy));
}

/**
 * Updates the state of a cell in the grid identified by the given identifier.
 *
 * @template TCellData - The type of data stored in the grid cells.
 * @param grid - The grid containing the cell to update.
 * @param identifier - The identifier of the cell to update.
 * @param newState - The new state to set for the cell.
 * @returns The updated grid.
 */
function updateCellState<TCellData>(
  grid: GridMapType<TCellData>,
  identifier: string,
  newState: GridMapCellState,
): GridMapType<TCellData> {
  const cell: GridMapCellType<TCellData | null> | null = getCellById(grid, identifier);

  if (cell) {
    cell.state = newState;
  }

  return grid;
}

/**
 * Helper function to retrieve adjacent cell IDs based on grid adjacency.
 * Uses orthogonal offsets if grid adjacency is 'orthogonal',
 * or all offsets (including diagonals) if 'diagonal'.
 *
 * @template TCellData - The type of data stored in the grid cells.
 * @param grid - The grid object.
 * @param x - The x-coordinate of the cell.
 * @param y - The y-coordinate of the cell.
 * @returns {string[]} - Array of adjacent cell IDs.
 */
function _getAdjacentIdsByCoordinate<TCellData>(
  grid: GridMapType<TCellData>,
  x: number,
  y: number,
): string[] {
  const offsets = OFFSETS[grid.adjacency];

  const adjacentIds: string[] = [];

  for (const { dx, dy } of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (_isWithinBounds(grid, nx, ny)) {
      const adjacentCell = getCellByCoordinates(grid, nx, ny);
      if (adjacentCell) adjacentIds.push(adjacentCell.id);
    }
  }

  return adjacentIds;
}

function getAdjacentIdsToCellId<TCellData>(
  grid: GridMapType<TCellData>,
  id: string,
  adjacency: GridMapAdjacency,
  cellState?: GridMapCellState,
): string[] {
  const { x, y } = parseCellId(id);
  const offsets = OFFSETS[adjacency];

  const adjacentIds: string[] = [];

  for (const { dx, dy } of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (_isWithinBounds(grid, nx, ny)) {
      const adjacentCell = getCellByCoordinates(grid, nx, ny);
      if (adjacentCell && (cellState ? adjacentCell.state === cellState : true))
        adjacentIds.push(adjacentCell.id);
    }
  }

  return adjacentIds;
}

/**
 * Creates a path on the grid starting from a specified cell and extending to a specified length.
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid where the path will be created.
 * @param length - The desired length of the path.
 * @param startId - The starting cell's ID.
 * @param options - Optional parameters for the path generation.
 * @param options.endId - The optional endpoint cell's ID.
 * @param options.allowRepetition - Whether to allow cells to be visited multiple times.
 * @returns An object with the generated path ID and the path array of cell IDs.
 */
function createPath<TCellData>(
  grid: GridMapType<TCellData | null>,
  length: number,
  startId: string,
  options: { endId?: string; allowRepetition?: boolean } = {},
): { id: string; path: string[] } | null {
  const { endId, allowRepetition = false } = options;
  const path: string[] = [startId];
  let currentId = startId;

  for (let i = 1; i < length; i++) {
    const currentCell = getCellById(grid, currentId);
    if (!currentCell) break;

    // Get adjacent cells (orthogonal only to avoid circular paths)
    const adjacentIds = _getAdjacentIdsByCoordinate(grid, currentCell.x, currentCell.y);

    // Filter out cells already in the path if repetition is not allowed
    const validNextIds = adjacentIds.filter((id) => allowRepetition || !path.includes(id));
    if (validNextIds.length === 0) break;

    // Choose the next cell, prioritizing endId if it's the final step
    const nextId =
      i === length - 1 && endId && validNextIds.includes(endId) ? endId : sample(validNextIds) || null;

    if (!nextId) break;

    path.push(nextId);
    currentId = nextId;
  }

  // Ensure path length and endpoint match requirements
  if (path.length !== length || (endId && path[path.length - 1] !== endId)) {
    return null; // Path couldn't meet requirements
  }

  return { id: path.join(';;'), path };
}

/**
 * Creates multiple unique paths on the grid using the createPath function.
 * @template TCellData - The type of data stored in each cell of the grid.
 * @param grid - The grid where the paths will be created.
 * @param numPaths - The number of unique paths to create.
 * @param startIds - An array of starting cell IDs for each path.
 * @param pathLength - The length of each path.
 * @param allowRepetition - Whether cells can be visited multiple times within paths.
 * @returns An array of path objects, each containing an id and the path array of cell IDs.
 */
function createPaths<TCellData>(
  grid: GridMapType<TCellData | null>,
  numPaths: number,
  startIds: string[],
  pathLength: number,
  allowRepetition = false,
): { id: string; path: string[] }[] {
  const paths: { id: string; path: string[] }[] = [];

  for (let i = 0; i < numPaths; i++) {
    const startId = startIds[i % startIds.length];
    const newPath = createPath(grid, pathLength, startId, { allowRepetition });

    // Ensure uniqueness of paths
    if (newPath && !paths.some((p) => p.id === newPath.id)) {
      paths.push(newPath);
    } else {
      i--; // Retry if path is not unique or couldn't be created
    }
  }

  return paths;
}

export const gridMapUtils = {
  createGridMap,
  getCellById,
  getCellByCoordinates,
  updateCell,
  updateCellState,
  getEmptyCells,
  getOrigin,
  getOriginId,
  getAllAdjacentCoordinates,
  getAllAdjacentIds,
  getAdjacentIdsToCellId,
  createPath,
  createPaths,
  composeCellId,
  parseCellId,
  getCellIndex,
};
