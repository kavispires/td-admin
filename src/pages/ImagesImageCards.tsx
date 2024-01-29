import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDIData } from 'hooks/useTDIData';
import { isEmpty } from 'lodash';

export function ImagesImageCards() {
  // Set default query params
  useQueryParams({ deck: 'd1' });

  const { isLoading, error, data } = useTDIData();
  const hasResponseData = !isEmpty(data);

  return (
    <PageLayout title="Images" subtitle="Image Cards">
      <Layout hasSider>
        <PageSider>
          <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            Content {JSON.stringify(data)}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
