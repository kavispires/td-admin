/**
 * Type for representing a field value with its type information
 */
export type FieldValue = {
  key: string;
  value: unknown;
  type: 'primitive' | 'array' | 'object' | 'dualLanguage' | 'null';
  depth: number;
};

/**
 * Checks if a value is a plain object (not Array, Date, null, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Checks if an object is a dual language value (has 'en' and 'pt' keys)
 */
export function isDualLanguage(value: unknown): value is { en: string; pt: string } {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('en') && keys.includes('pt');
}

/**
 * Formats a value for display in PDF based on its type
 * @param value - The value to format
 * @returns Formatted string representation
 */
export function formatValue(value: unknown): string {
  if (value == null) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (isDualLanguage(value)) {
    return `EN: ${value.en} | PT: ${value.pt}`;
  }

  if (isPlainObject(value)) {
    // For nested objects, show as JSON
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

/**
 * Analyzes an object and returns its fields with type information
 * @param obj - Object to analyze
 * @param depth - Current depth level (for recursion tracking)
 * @param maxDepth - Maximum depth to traverse (default: 3)
 * @returns Array of field values with type information
 */
export function analyzeFields(obj: Record<string, unknown>, depth = 0, maxDepth = 3): FieldValue[] {
  const fields: FieldValue[] = [];

  for (const [key, value] of Object.entries(obj)) {
    // Skip null/undefined
    if (value == null) {
      fields.push({ key, value: null, type: 'null', depth });
      continue;
    }

    // Check for dual language
    if (isDualLanguage(value)) {
      fields.push({ key, value, type: 'dualLanguage', depth });
      continue;
    }

    // Check for arrays
    if (Array.isArray(value)) {
      fields.push({ key, value, type: 'array', depth });
      continue;
    }

    // Check for nested objects
    if (isPlainObject(value) && depth < maxDepth) {
      fields.push({ key, value, type: 'object', depth });
      // Add nested fields recursively
      const nestedFields = analyzeFields(value as Record<string, unknown>, depth + 1, maxDepth);
      fields.push(...nestedFields);
      continue;
    }

    // Primitives
    fields.push({ key, value, type: 'primitive', depth });
  }

  return fields;
}

/**
 * Flattens an object for table display using dot notation
 * @param obj - Object to flatten
 * @param prefix - Prefix for keys (used in recursion)
 * @param depth - Current depth (used in recursion)
 * @param maxDepth - Maximum depth to traverse
 * @returns Flattened object with dot notation keys
 */
export function flattenForTable(
  obj: Record<string, unknown>,
  prefix = '',
  depth = 0,
  maxDepth = 3,
): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value == null) {
      flattened[newKey] = '—';
      continue;
    }

    if (Array.isArray(value)) {
      flattened[newKey] = value.join(', ');
      continue;
    }

    if (isPlainObject(value) && depth < maxDepth) {
      const nested = flattenForTable(value as Record<string, unknown>, newKey, depth + 1, maxDepth);
      Object.assign(flattened, nested);
      continue;
    }

    flattened[newKey] = formatValue(value);
  }

  return flattened;
}

/**
 * Gets all unique column names from an array of objects
 * @param data - Array of objects
 * @returns Sorted array of column names (with 'id' first if present)
 */
export function getTableColumns(data: Array<Record<string, unknown>>): string[] {
  const columns = new Set<string>();

  for (const item of data) {
    const flattened = flattenForTable(item);
    for (const key of Object.keys(flattened)) {
      columns.add(key);
    }
  }

  const sortedColumns = Array.from(columns).sort((a, b) => {
    if (a === 'id') return -1;
    if (b === 'id') return 1;
    return a.localeCompare(b);
  });

  return sortedColumns;
}

/**
 * Formats a field key for display (converts camelCase to Title Case)
 * @param key - Field key to format
 * @returns Formatted key
 * @example
 * formatFieldKey('firstName') // Returns: 'First Name'
 * formatFieldKey('persona.en') // Returns: 'Persona.En'
 */
export function formatFieldKey(key: string): string {
  // Handle dot notation
  if (key.includes('.')) {
    return key
      .split('.')
      .map((part) => formatFieldKey(part))
      .join('.');
  }

  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Chunks an array into smaller arrays of specified size
 * Useful for pagination
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
