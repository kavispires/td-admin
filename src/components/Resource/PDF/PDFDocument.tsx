import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';

type PDFDocumentProps = {
  /**
   * Title of the document
   */
  title: string;
  /**
   * Subtitle/description (e.g., resource name)
   */
  subtitle?: string;
  /**
   * Child components to render (PDFCardView or PDFTableView)
   */
  children: React.ReactNode;
};

/**
 * PDF Document wrapper component with header and footer
 */
export function PDFDocument({ title, subtitle, children }: PDFDocumentProps) {
  return (
    <Document>
      <Page
        size="A4"
        style={pdfStyles.page}
      >
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{title}</Text>
          {subtitle && <Text style={pdfStyles.subtitle}>{subtitle}</Text>}
        </View>

        {children}

        <View
          fixed
          style={pdfStyles.footer}
        >
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
