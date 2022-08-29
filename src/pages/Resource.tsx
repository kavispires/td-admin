import { Layout, Tabs } from 'antd';
import { ResourceCards } from 'components/ResourceCards';
import { ResourceJson } from 'components/ResourceJson';
import { ResourceTable } from 'components/ResourceTable';
import { useState } from 'react';
import { useTitle } from 'react-use';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionBar } from '../components/ResourceSelectionBar';
import { useQueryParams } from '../hooks/useQueryParams';
import { useResourceState } from '../hooks/useResourceState';
import { RESOURCE_NAMES } from '../utils/constants';

const resourceNames = Object.values(RESOURCE_NAMES);

export function Resource() {
  useTitle('Resource Viewer');
  const [activeTab, setActiveTab] = useState('json');

  const { resourceName, language, loading, error, updateResource, hasResponseData, response } =
    useResourceState(resourceNames, {});

  const { params } = useQueryParams({ resourceName, language }, updateResource);

  return (
    <Layout className="container">
      <ResourceSelectionBar
        title={`Data for ${resourceName}-${language}`}
        initialValues={{
          resourceName,
          language,
        }}
        resourceNames={resourceNames}
        values={params}
        updateState={updateResource}
        hasResponseData={hasResponseData}
        loading={loading}
        error={error}
      />

      <Layout.Content className="content">
        <DataLoadingWrapper loading={loading} error={error} hasResponseData={hasResponseData}>
          <Tabs
            defaultActiveKey={activeTab}
            onChange={(tabKey) => setActiveTab(tabKey)}
            className="page-content-tabs"
          >
            <Tabs.TabPane tab="JSON" key="json">
              <ResourceJson response={response ?? {}} resourceName={resourceName ?? ''} />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Cards" key="cards">
              <ResourceCards response={response ?? {}} resourceName={resourceName ?? ''} />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Table" key="table">
              <ResourceTable response={response ?? {}} resourceName={resourceName ?? ''} />
            </Tabs.TabPane>
          </Tabs>
        </DataLoadingWrapper>
      </Layout.Content>
    </Layout>
  );
}
