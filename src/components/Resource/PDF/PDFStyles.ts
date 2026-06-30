import { StyleSheet } from '@react-pdf/renderer';

/**
 * Shared styles for PDF components
 */
export const pdfStyles = StyleSheet.create({
  // Page styles
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // Header styles
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },

  // Card view styles
  card: {
    marginBottom: 15,
    padding: 12,
    border: '1 solid #ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1890ff',
    borderBottom: '1 solid #e8e8e8',
    paddingBottom: 4,
  },
  field: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  fieldKey: {
    fontWeight: 'bold',
    minWidth: 120,
    color: '#333',
  },
  fieldValue: {
    flex: 1,
    color: '#666',
  },
  nestedField: {
    marginLeft: 15,
    marginBottom: 3,
  },
  arrayValue: {
    fontStyle: 'italic',
    color: '#666',
  },
  dualLanguage: {
    marginLeft: 15,
    marginBottom: 2,
    fontSize: 9,
    color: '#666',
  },

  // Table view styles
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1890ff',
    color: 'white',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e8e8e8',
    padding: 6,
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #e8e8e8',
    backgroundColor: '#f5f5f5',
    padding: 6,
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
    paddingRight: 4,
    overflow: 'hidden',
  },
  tableCellHeader: {
    flex: 1,
    paddingRight: 4,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1 solid #e8e8e8',
    paddingTop: 5,
  },

  // Utility styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    borderBottom: '1 solid #ccc',
    paddingBottom: 5,
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
  },
});
