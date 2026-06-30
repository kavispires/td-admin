import { Text, View } from '@react-pdf/renderer';
import { analyzeFields, formatFieldKey, formatValue, isDualLanguage } from 'utils/pdf-helpers';
import { pdfStyles } from './PDFStyles';

type PDFCardViewProps = {
  /**
   * Array of data entries to display as cards
   */
  data: Array<Record<string, unknown>>;
  /**
   * Optional section title (e.g., resource name)
   */
  sectionTitle?: string;
};

type CardProps = {
  /**
   * Entry data to display
   */
  entry: Record<string, unknown>;
};

/**
 * Renders a single field value with appropriate formatting
 */
function FieldValue({ fieldKey, value, depth }: { fieldKey: string; value: unknown; depth: number }) {
  // Handle null/undefined
  if (value == null) {
    return (
      <View style={depth > 0 ? [pdfStyles.field, pdfStyles.nestedField] : pdfStyles.field}>
        <Text style={pdfStyles.fieldKey}>{formatFieldKey(fieldKey)}:</Text>
        <Text style={pdfStyles.fieldValue}>—</Text>
      </View>
    );
  }

  // Handle dual language
  if (isDualLanguage(value)) {
    return (
      <View style={depth > 0 ? [pdfStyles.field, pdfStyles.nestedField] : pdfStyles.field}>
        <Text style={pdfStyles.fieldKey}>{formatFieldKey(fieldKey)}:</Text>
        <View style={{ flex: 1 }}>
          <Text style={pdfStyles.dualLanguage}>EN: {value.en}</Text>
          <Text style={pdfStyles.dualLanguage}>PT: {value.pt}</Text>
        </View>
      </View>
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return (
      <View style={depth > 0 ? [pdfStyles.field, pdfStyles.nestedField] : pdfStyles.field}>
        <Text style={pdfStyles.fieldKey}>{formatFieldKey(fieldKey)}:</Text>
        <Text style={[pdfStyles.fieldValue, pdfStyles.arrayValue]}>{value.join(', ')}</Text>
      </View>
    );
  }

  // Handle nested objects (recursively up to depth 3)
  if (typeof value === 'object' && depth < 3) {
    const nestedFields = analyzeFields(value as Record<string, unknown>, depth + 1);

    return (
      <View style={depth > 0 ? [pdfStyles.field, pdfStyles.nestedField] : pdfStyles.field}>
        <View style={{ flex: 1 }}>
          <Text style={pdfStyles.fieldKey}>{formatFieldKey(fieldKey)}:</Text>
          <View style={{ marginLeft: 10 }}>
            {nestedFields.map((field, idx) => (
              <FieldValue
                depth={field.depth}
                fieldKey={field.key}
                key={`${field.key}-${idx}`}
                value={field.value}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Handle primitives
  return (
    <View style={depth > 0 ? [pdfStyles.field, pdfStyles.nestedField] : pdfStyles.field}>
      <Text style={pdfStyles.fieldKey}>{formatFieldKey(fieldKey)}:</Text>
      <Text style={pdfStyles.fieldValue}>{formatValue(value)}</Text>
    </View>
  );
}

/**
 * Renders a single card for an entry
 */
function Card({ entry }: CardProps) {
  const fields = analyzeFields(entry);
  const titleField = entry.id || entry.name || entry.title || 'Entry';

  return (
    <View
      style={pdfStyles.card}
      wrap={false}
    >
      <Text style={pdfStyles.cardTitle}>{String(titleField)}</Text>
      {fields.map((field, idx) => (
        <FieldValue
          depth={field.depth}
          fieldKey={field.key}
          key={`${field.key}-${idx}`}
          value={field.value}
        />
      ))}
    </View>
  );
}

/**
 * PDF Card View component - renders data as individual cards with hierarchical layout
 */
export function PDFCardView({ data, sectionTitle }: PDFCardViewProps) {
  if (!data || data.length === 0) {
    return (
      <View style={pdfStyles.emptyState}>
        <Text>No data to display</Text>
      </View>
    );
  }

  return (
    <View style={pdfStyles.section}>
      {sectionTitle && <Text style={pdfStyles.sectionTitle}>{sectionTitle}</Text>}
      {data.map((entry, idx) => (
        <Card
          entry={entry}
          key={String(entry.id) || idx}
        />
      ))}
    </View>
  );
}
