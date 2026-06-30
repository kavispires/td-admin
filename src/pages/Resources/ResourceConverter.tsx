import { Alert, Divider, Layout, Space, Table, Typography } from 'antd';
import { ResponseState } from 'components/Common';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { MultiResourceSelectionFilters } from 'components/Resource/MultiResourceSelectionFilters';
import { ResourceExportControls } from 'components/Resource/ResourceExportControls';
import { useMultiResourceState } from 'hooks/useMultiResourceState';
import { useQueryParams } from 'hooks/useQueryParams';
import { RESOURCES_NAMES } from 'utils/resources-list';

const resourceNames = Object.values(RESOURCES_NAMES);

function ResourceConverter() {
  const { queryParams } = useQueryParams();

  // Parse selected resources from query params
  const selectedResourcesParam = queryParams.get('resources') ?? '';
  const selectedResources = selectedResourcesParam ? selectedResourcesParam.split(',').filter(Boolean) : [];
  const language = queryParams.get('language') as Language | null;

  // Load multiple resources
  const { mergedData, isLoading, hasAllData, error, enabled } = useMultiResourceState(
    selectedResources,
    language,
  );

  const generateSubtitle = () => {
    if (selectedResources.length === 0) return 'Export resources to CSV or PDF';
    const parts: string[] = [];
    parts.push(`${selectedResources.length} ${selectedResources.length === 1 ? 'resource' : 'resources'}`);
    if (language) parts.push(language.toUpperCase());
    if (hasAllData) parts.push(`${mergedData.length} ${mergedData.length === 1 ? 'entry' : 'entries'}`);
    return parts.join(' | ');
  };

  return (
    <PageLayout
      subtitle={generateSubtitle()}
      title="Resource Converter"
    >
      <Layout hasSider>
        <PageSider>
          <ResponseState
            error={error}
            hasResponseData={hasAllData}
            isIdle={!enabled || selectedResources.length === 0}
            isLoading={isLoading}
          />
          <Divider style={{ margin: '12px 0' }} />
          <MultiResourceSelectionFilters resourceNames={resourceNames} />
          <Divider style={{ margin: '12px 0' }} />
          <ResourceExportControls
            data={mergedData}
            hasData={hasAllData}
            isLoading={isLoading}
            language={language}
            resourceNames={selectedResources}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={error}
            hasResponseData={hasAllData}
            isIdle={!enabled || selectedResources.length === 0}
            isLoading={isLoading}
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Alert
                description="Select resources from the sidebar, configure export options, and download as CSV or PDF."
                message="Export Resources"
                showIcon
                type="info"
              />

              {hasAllData && mergedData.length > 0 && (
                <>
                  <Typography.Title level={4}>
                    Data Preview ({mergedData.length} {mergedData.length === 1 ? 'entry' : 'entries'})
                  </Typography.Title>

                  <Table
                    columns={generatePreviewColumns(mergedData)}
                    dataSource={mergedData}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} entries`,
                    }}
                    rowKey={(record) => String(record.id) || JSON.stringify(record)}
                    scroll={{ x: 'max-content' }}
                    size="small"
                  />
                </>
              )}
            </Space>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

/**
 * Generate preview table columns dynamically based on data
 */
function generatePreviewColumns(data: Array<Record<string, unknown>>) {
  if (data.length === 0) return [];

  // Get all unique keys from first few entries (to avoid processing too many)
  const sampleSize = Math.min(10, data.length);
  const allKeys = new Set<string>();

  for (let i = 0; i < sampleSize; i++) {
    Object.keys(data[i]).forEach((key) => {
      // Skip internal metadata
      if (key !== '_source') {
        allKeys.add(key);
      }
    });
  }

  // Convert to sorted array with 'id' first
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    if (a === 'id') return -1;
    if (b === 'id') return 1;
    return a.localeCompare(b);
  });

  // Limit to first 10 columns for preview
  const limitedKeys = sortedKeys.slice(0, 10);

  return limitedKeys.map((key) => ({
    title: key,
    dataIndex: key,
    key,
    width: 150,
    ellipsis: true,
    render: (value: unknown) => {
      if (value == null) return '—';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    },
  }));
}

export default ResourceConverter;
