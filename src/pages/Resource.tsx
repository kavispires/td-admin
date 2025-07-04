import { Layout } from 'antd';
import { ResponseState } from 'components/Common';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceCards } from 'components/Resource/ResourceCards';
import { ResourceDisplayMode } from 'components/Resource/ResourceDisplayMode';
import { ResourceJson } from 'components/Resource/ResourceJson';
import { ResourceSelectionFilters } from 'components/Resource/ResourceSelectionFilters';
import { ResourceTable } from 'components/Resource/ResourceTable';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceState } from 'hooks/useResourceState';
import { RESOURCE_NAMES } from 'utils/constants';

const resourceNames = Object.values(RESOURCE_NAMES);

function Resource() {
  const {
    resourceName = '',
    language = '',
    isLoading,
    enabled,
    error,
    hasResponseData,
    response,
  } = useResourceState(resourceNames);

  const { queryParams } = useQueryParams();
  const display = queryParams.get('display') ?? 'json';

  return (
    <PageLayout
      subtitle={resourceName && language ? `Data for ${resourceName}-${language}` : ''}
      title="Resource"
    >
      <Layout hasSider>
        <PageSider>
          <ResponseState
            error={error}
            hasResponseData={hasResponseData}
            isIdle={!enabled}
            isLoading={isLoading}
          />
          <ResourceSelectionFilters resourceNames={resourceNames} />
          <ResourceDisplayMode />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={error}
            hasResponseData={hasResponseData}
            isIdle={!enabled}
            isLoading={isLoading}
          >
            {display === 'json' && (
              <ResourceJson resourceName={resourceName ?? ''} response={response ?? {}} />
            )}

            {display === 'table' && (
              <ResourceTable resourceName={resourceName ?? ''} response={response ?? {}} />
            )}

            {display === 'cards' && (
              <ResourceCards resourceName={resourceName ?? ''} response={response ?? {}} />
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Resource;
