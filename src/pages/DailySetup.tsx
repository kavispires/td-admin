import { Layout, Typography } from 'antd';
import { ResponseState } from 'components/Common';
import { DataPopulation } from 'components/Daily/DataPopulation';
import { SideFilters } from 'components/Daily/SideFilters';
import { useLoadDailySetup } from 'components/Daily/hooks';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useState } from 'react';

function DailySetup() {
  const [language, setLanguage] = useState('');
  const [drawingsCount, setDrawingsCount] = useState(3);
  const [batchSize, setBatchSize] = useState(7);

  const dataLoad = useLoadDailySetup(Boolean(language), language as Language, drawingsCount, batchSize);

  return (
    <PageLayout title="Daily Setup">
      <Layout hasSider>
        <PageSider>
          <ResponseState isLoading={dataLoad.isLoading} error={null} hasResponseData={!dataLoad.isLoading} />
          <SideFilters
            language={language}
            setLanguage={setLanguage}
            drawingsCount={drawingsCount}
            setDrawingsCount={setDrawingsCount}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
          />
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

export default DailySetup;
