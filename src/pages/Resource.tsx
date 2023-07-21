import { Layout } from 'antd';
import { ResourceCards } from 'components/Resource/ResourceCards';
import { ResourceJson } from 'components/Resource/ResourceJson';
import { ResourceTable } from 'components/Resource/ResourceTable';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionFilters } from '../components/Resource/ResourceSelectionFilters';
import { useQueryParams } from '../hooks/useQueryParams';
import { useResourceState } from '../hooks/useResourceState';
import { RESOURCE_NAMES } from '../utils/constants';
import { Header } from 'components/Layout/Header';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { ResourceDisplayMode } from 'components/Resource/ResourceDisplayMode';

const resourceNames = Object.values(RESOURCE_NAMES);

export function Resource() {
  // const [activeTab, setActiveTab] = useState('json');

  const {
    resourceName = '',
    language = '',
    isLoading,
    error,
    hasResponseData,
    response,
  } = useResourceState(resourceNames);

  const {
    queryParams: { display = 'json' },
  } = useQueryParams();

  return (
    <Layout className="layout">
      <Header
        title="Resource"
        subtitle={Boolean(resourceName && language) ? `Data for ${resourceName}-${language}` : ''}
      />

      <Layout hasSider>
        <Layout.Sider className="sider">
          <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <ResourceSelectionFilters resourceNames={resourceNames} />
          <ResourceDisplayMode />
        </Layout.Sider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            {display === 'json' && (
              <ResourceJson response={response ?? {}} resourceName={resourceName ?? ''} />
            )}

            {display === 'cards' && (
              <ResourceCards response={response ?? {}} resourceName={resourceName ?? ''} />
            )}

            {display === 'table' && (
              <ResourceTable response={response ?? {}} resourceName={resourceName ?? ''} />
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
