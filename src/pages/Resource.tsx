import { Layout } from 'antd';
import { PageLayout } from 'components/Layout';
import { ResourceCards } from 'components/Resource/ResourceCards';
import { ResourceDisplayMode } from 'components/Resource/ResourceDisplayMode';
import { ResourceJson } from 'components/Resource/ResourceJson';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { ResourceTable } from 'components/Resource/ResourceTable';

import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ResourceSelectionFilters } from 'components/Resource/ResourceSelectionFilters';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceState } from 'hooks/useResourceState';
import { RESOURCE_NAMES } from 'utils/constants';

const resourceNames = Object.values(RESOURCE_NAMES);

export function Resource() {
  // const [activeTab, setActiveTab] = useState('json');

  const {
    resourceName = '',
    language = '',
    isLoading,
    enabled,
    error,
    hasResponseData,
    response,
  } = useResourceState(resourceNames);

  const {
    queryParams: { display = 'json' },
  } = useQueryParams();

  return (
    <PageLayout
      title="Resource"
      subtitle={Boolean(resourceName && language) ? `Data for ${resourceName}-${language}` : ''}
    >
      <Layout hasSider>
        <Layout.Sider className="sider">
          <div className="sider__content">
            <ResourceResponseState
              hasResponseData={hasResponseData}
              isLoading={isLoading}
              error={error}
              isIdle={!enabled}
            />
            <ResourceSelectionFilters resourceNames={resourceNames} />
            <ResourceDisplayMode />
          </div>
        </Layout.Sider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={isLoading}
            error={error}
            hasResponseData={hasResponseData}
            isIdle={!enabled}
          >
            {display === 'json' && (
              <ResourceJson response={response ?? {}} resourceName={resourceName ?? ''} />
            )}

            {display === 'table' && (
              <ResourceTable response={response ?? {}} resourceName={resourceName ?? ''} />
            )}

            {display === 'cards' && (
              <ResourceCards response={response ?? {}} resourceName={resourceName ?? ''} />
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
