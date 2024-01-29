import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useQueryParams } from 'hooks/useQueryParams';

export function ImagesCrimeEvidence() {
  // Set default query params
  useQueryParams({ deck: 1 });

  const isLoading = false;
  const error = null;
  const hasResponseData = false;

  return (
    <PageLayout title="Images" subtitle="Crime Evidence">
      <Layout hasSider>
        <PageSider>
          <div>Options</div>
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            Content
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
