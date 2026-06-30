import { Text, View } from '@react-pdf/renderer';
import { chunkArray, flattenForTable, formatFieldKey, getTableColumns } from 'utils/pdf-helpers';
import { pdfStyles } from './PDFStyles';

type PDFTableViewProps = {
  /**
   * Array of data entries to display in table format
   */
  data: Array<Record<string, unknown>>;
  /**
   * Optional section title (e.g., resource name)
   */
  sectionTitle?: string;
  /**
   * Number of rows per page before creating a new table with headers
   * Default: 20
   */
  rowsPerPage?: number;
};

type TableHeaderProps = {
  /**
   * Column names to display in header
   */
  columns: string[];
};

type TableRowProps = {
  /**
   * Row data (flattened)
   */
  row: Record<string, string>;
  /**
   * Column names in order
   */
  columns: string[];
  /**
   * Whether this is an alternate row (for zebra striping)
   */
  isAlt: boolean;
};

/**
 * Renders table header with column names
 */
function TableHeader({ columns }: TableHeaderProps) {
  return (
    <View
      fixed
      style={pdfStyles.tableHeader}
    >
      {columns.map((column) => (
        <Text
          key={column}
          style={pdfStyles.tableCellHeader}
        >
          {formatFieldKey(column)}
        </Text>
      ))}
    </View>
  );
}

/**
 * Renders a single table row
 */
function TableRow({ row, columns, isAlt }: TableRowProps) {
  return (
    <View style={isAlt ? pdfStyles.tableRowAlt : pdfStyles.tableRow}>
      {columns.map((column) => (
        <Text
          key={column}
          style={pdfStyles.tableCell}
        >
          {row[column] || '—'}
        </Text>
      ))}
    </View>
  );
}

/**
 * PDF Table View component - renders data as a table with repeating headers
 */
export function PDFTableView({ data, sectionTitle, rowsPerPage = 20 }: PDFTableViewProps) {
  if (!data || data.length === 0) {
    return (
      <View style={pdfStyles.emptyState}>
        <Text>No data to display</Text>
      </View>
    );
  }

  // Get all columns and flatten all data
  const columns = getTableColumns(data);
  const flattenedData = data.map((item) => flattenForTable(item));

  // Chunk data for pagination
  const chunks = chunkArray(flattenedData, rowsPerPage);

  return (
    <View style={pdfStyles.section}>
      {sectionTitle && <Text style={pdfStyles.sectionTitle}>{sectionTitle}</Text>}

      {chunks.map((chunk, chunkIdx) => (
        <View
          key={chunkIdx}
          style={pdfStyles.table}
          wrap={false}
        >
          <TableHeader columns={columns} />
          {chunk.map((row, rowIdx) => (
            <TableRow
              columns={columns}
              isAlt={rowIdx % 2 === 1}
              key={rowIdx}
              row={row}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
