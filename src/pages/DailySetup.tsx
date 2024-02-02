import { Layout, Typography } from 'antd';
import { DataPopulation } from 'components/Daily/DataPopulation';
import { SideFilters } from 'components/Daily/SideFilters';
import { useLoadDailySetup } from 'components/Daily/hooks';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { useState } from 'react';

export function DailySetup() {
  const [language, setLanguage] = useState('');

  const dataLoad = useLoadDailySetup(Boolean(language), language as Language);

  return (
    <PageLayout title="Daily Setup">
      <Layout hasSider>
        <PageSider>
          <ResourceResponseState
            isLoading={dataLoad.isLoading}
            error={null}
            hasResponseData={!dataLoad.isLoading}
          />
          <SideFilters language={language} setLanguage={setLanguage} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={dataLoad.isLoading}
            error={null}
            hasResponseData={!dataLoad.isLoading}
          >
            <Typography.Title level={2}>Data Population</Typography.Title>
            <DataPopulation language={language} dataLoad={dataLoad} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
