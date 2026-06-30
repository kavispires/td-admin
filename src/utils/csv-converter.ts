import Papa from 'papaparse';

type FlattenedObject = Record<string, string | number | boolean | null>;

/**
 * Checks if a value is a plain object (not Array, Date, null, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Flattens a nested object using dot notation.
 * Arrays are joined with commas, nested objects are flattened recursively up to 3 levels deep.
 * @param obj - The object to flatten
 * @param prefix - The prefix for nested keys (used internally for recursion)
 * @param depth - Current depth level (used internally to limit recursion)
 * @returns Flattened object with dot notation keys
 * @example
 * flattenObject({ persona: { en: "poet", pt: "poeta" }, traits: ["artistic", "gentle"] })
 * // Returns: { "persona.en": "poet", "persona.pt": "poeta", "traits": "artistic, gentle" }
 */
export function flattenObject(obj: Record<string, unknown>, prefix = '', depth = 0): FlattenedObject {
  const flattened: FlattenedObject = {};
  const maxDepth = 3;

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    // Handle null/undefined
    if (value == null) {
      flattened[newKey] = null;
      continue;
    }

    // Handle arrays - join with commas
    if (Array.isArray(value)) {
      flattened[newKey] = value.join(', ');
      continue;
    }

    // Handle nested objects - recurse up to maxDepth
    if (isPlainObject(value) && depth < maxDepth) {
      const nested = flattenObject(value as Record<string, unknown>, newKey, depth + 1);
      Object.assign(flattened, nested);
      continue;
    }

    // Handle primitives and objects beyond maxDepth
    if (typeof value === 'object') {
      // If we've hit max depth, stringify the object
      flattened[newKey] = JSON.stringify(value);
    } else {
      flattened[newKey] = value as string | number | boolean;
    }
  }

  return flattened;
}

/**
 * Converts an array of objects to CSV format.
 * Nested objects are flattened using dot notation, arrays are comma-separated.
 * @param data - Array of objects to convert
 * @returns CSV string
 * @example
 * convertToCSV([
 *   { id: "us-001", name: "John", traits: ["smart", "kind"] },
 *   { id: "us-002", name: "Jane", traits: ["brave"] }
 * ])
 * // Returns: CSV with columns: id, name, traits
 * // Row 1: us-001, John, "smart, kind"
 * // Row 2: us-002, Jane, brave
 */
export function convertToCSV(data: Array<Record<string, unknown>>): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Flatten all objects
  const flattenedData = data.map((item) => flattenObject(item));

  // Get all unique keys from all objects (some objects may have different fields)
  const allKeys = new Set<string>();
  for (const item of flattenedData) {
    for (const key of Object.keys(item)) {
      allKeys.add(key);
    }
  }

  // Sort keys alphabetically but keep 'id' first if it exists
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    if (a === 'id') return -1;
    if (b === 'id') return 1;
    return a.localeCompare(b);
  });

  // Create data array with consistent field order
  const formattedData = flattenedData.map((item) => {
    const row: Record<string, string | number | boolean | null> = {};
    sortedKeys.forEach((key) => {
      row[key] = item[key] ?? null;
    });
    return row;
  });

  // Use papaparse to generate CSV
  return Papa.unparse(formattedData, {
    quotes: true, // Quote all fields to handle commas in values
    header: true,
  });
}

/**
 * Downloads data as a CSV file
 * @param data - Array of objects to convert to CSV
 * @param filename - Name of the file to download (should end with .csv)
 */
export function downloadAsCSV(data: Array<Record<string, unknown>>, filename: string): void {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
