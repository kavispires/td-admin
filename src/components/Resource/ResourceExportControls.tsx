import { FilePdfOutlined, FileTextOutlined, IdcardOutlined, TableOutlined } from '@ant-design/icons';
import { SiderContent } from '@components/Layout';
import { pdf } from '@react-pdf/renderer';
import { downloadAsCSV } from '@utils/csv-converter';
import { Alert, Button, Divider, Segmented, Space, Typography } from 'antd';
import { useState } from 'react';
import { PDFCardView } from './PDF/PDFCardView';
import { PDFDocument } from './PDF/PDFDocument';
import { PDFTableView } from './PDF/PDFTableView';

type ExportFormat = 'csv' | 'pdf';
type PDFViewMode = 'cards' | 'table';

type ResourceExportControlsProps = {
  /**
   * Data to export
   */
  data: Array<Record<string, unknown>>;
  /**
   * Whether data is available
   */
  hasData: boolean;
  /**
   * Resource names being exported
   */
  resourceNames: string[];
  /**
   * Language of the resources
   */
  language?: string | null;
  /**
   * Whether data is currently loading
   */
  isLoading: boolean;
};

/**
 * Export controls component for Resource Converter
 * Allows selection of export format (CSV/PDF) and PDF view mode (Cards/Table)
 */
export function ResourceExportControls({
  data,
  hasData,
  resourceNames,
  language,
  isLoading,
}: ResourceExportControlsProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [pdfViewMode, setPdfViewMode] = useState<PDFViewMode>('cards');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (!hasData || data.length === 0) return;

    setIsExporting(true);
    try {
      const filename = generateFilename('csv');
      // Remove the _source metadata field before exporting
      const cleanData = data.map(({ _source, ...rest }) => rest);
      downloadAsCSV(cleanData, filename);
    } catch (error) {
      alert(`Failed to export CSV: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!hasData || data.length === 0) return;

    setIsExporting(true);
    try {
      const filename = generateFilename('pdf');
      const title = 'Resource Export';
      const subtitle = generateSubtitle();

      // Remove the _source metadata field before exporting
      const cleanData = data.map(({ _source, ...rest }) => rest);

      // Generate PDF document
      const doc = (
        <PDFDocument
          subtitle={subtitle}
          title={title}
        >
          {pdfViewMode === 'cards' ? (
            <PDFCardView
              data={cleanData}
              sectionTitle={resourceNames.join(', ')}
            />
          ) : (
            <PDFTableView
              data={cleanData}
              sectionTitle={resourceNames.join(', ')}
            />
          )}
        </PDFDocument>
      );

      // Generate blob and download
      const blob = await pdf(doc).toBlob();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export PDF: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generateFilename = (format: 'csv' | 'pdf') => {
    const resourcePart = resourceNames.filter(Boolean).join('-') || 'export';
    const languagePart = language ? `-${language}` : '';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${resourcePart}${languagePart}-${timestamp}.${format}`;
  };

  const generateSubtitle = () => {
    const parts: string[] = [];
    if (resourceNames.length > 0) {
      parts.push(`Resources: ${resourceNames.join(', ')}`);
    }
    if (language) {
      parts.push(`Language: ${language}`);
    }
    parts.push(`Entries: ${data.length}`);
    return parts.join(' | ');
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      handleExportCSV();
    } else {
      handleExportPDF();
    }
  };

  const isDisabled = !hasData || data.length === 0 || isLoading || isExporting;

  return (
    <SiderContent>
      <Typography.Title level={5}>Export Format</Typography.Title>
      <Segmented
        block
        onChange={(value) => setExportFormat(value as ExportFormat)}
        options={[
          { label: 'CSV', value: 'csv', icon: <FileTextOutlined /> },
          { label: 'PDF', value: 'pdf', icon: <FilePdfOutlined /> },
        ]}
        value={exportFormat}
      />

      {exportFormat === 'pdf' && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Typography.Title level={5}>PDF View Mode</Typography.Title>
          <Segmented
            block
            onChange={(value) => setPdfViewMode(value as PDFViewMode)}
            options={[
              { label: 'Cards', value: 'cards', icon: <IdcardOutlined /> },
              { label: 'Table', value: 'table', icon: <TableOutlined /> },
            ]}
            value={pdfViewMode}
          />
        </>
      )}

      <Divider style={{ margin: '12px 0' }} />

      <Button
        block
        disabled={isDisabled}
        icon={exportFormat === 'csv' ? <FileTextOutlined /> : <FilePdfOutlined />}
        loading={isExporting}
        onClick={handleExport}
        size="large"
        type="primary"
      >
        Export {exportFormat.toUpperCase()}
        {exportFormat === 'pdf' && ` (${pdfViewMode})`}
      </Button>

      <Divider style={{ margin: '12px 0' }} />

      {hasData && data.length > 0 && (
        <Alert
          message={
            <Space
              direction="vertical"
              size="small"
            >
              <Typography.Text strong>Ready to Export</Typography.Text>
              <Typography.Text type="secondary">
                {data.length} {data.length === 1 ? 'entry' : 'entries'} from {resourceNames.length}{' '}
                {resourceNames.length === 1 ? 'resource' : 'resources'}
              </Typography.Text>
            </Space>
          }
          type="success"
        />
      )}

      {data.length > 500 && (
        <Alert
          description="Large datasets may take longer to export, especially for PDF format."
          message="Large Dataset"
          showIcon
          style={{ marginTop: 8 }}
          type="warning"
        />
      )}

      {!hasData && !isLoading && (
        <Alert
          description="Select one or more resources to begin"
          message="No Data"
          type="info"
        />
      )}
    </SiderContent>
  );
}
