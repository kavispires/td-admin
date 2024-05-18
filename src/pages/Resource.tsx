import { Layout } from 'antd';
import { PageLayout } from 'components/Layout';
import { ResourceCards } from 'components/Resource/ResourceCards';
import { ResourceDisplayMode } from 'components/Resource/ResourceDisplayMode';
import { ResourceJson } from 'components/Resource/ResourceJson';
import { ResponseState } from 'components/Common';
import { ResourceTable } from 'components/Resource/ResourceTable';

import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ResourceSelectionFilters } from 'components/Resource/ResourceSelectionFilters';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceState } from 'hooks/useResourceState';
import { RESOURCE_NAMES } from 'utils/constants';
import { PageSider } from 'components/Layout/PageSider';

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
      title="Resource"
      subtitle={Boolean(resourceName && language) ? `Data for ${resourceName}-${language}` : ''}
    >
      <Layout hasSider>
        <PageSider>
          <ResponseState
            hasResponseData={hasResponseData}
            isLoading={isLoading}
            error={error}
            isIdle={!enabled}
          />
          <ResourceSelectionFilters resourceNames={resourceNames} />
          <ResourceDisplayMode />
        </PageSider>

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

export default Resource;
