import { Layout, Tabs } from 'antd';
import { ResourceCards } from 'components/Resource/ResourceCards';
import { ResourceJson } from 'components/Resource/ResourceJson';
import { ResourceTable } from 'components/Resource/ResourceTable';
import { useState } from 'react';
import { useTitle } from 'react-use';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionFilters } from '../components/Resource/ResourceSelectionFilters';
import { useQueryParams } from '../hooks/useQueryParams';
import { useResourceState } from '../hooks/useResourceState';
import { RESOURCE_NAMES } from '../utils/constants';
import { Header } from 'components/Layout/Header';

const resourceNames = Object.values(RESOURCE_NAMES);

export function ResourceGenerator() {
  useTitle('Resource Generator');
  const [activeTab, setActiveTab] = useState('json');

  return (
    <Layout className="container">
      <Header title="Resource Generator" subtitle="something" />
      {/* <ResourceSelectionFilters
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
      /> */}

      <Layout.Content className="content">
        {/* <DataLoadingWrapper loading={loading} error={error} hasResponseData={hasResponseData}>
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
        </DataLoadingWrapper> */}
      </Layout.Content>
    </Layout>
  );
}
