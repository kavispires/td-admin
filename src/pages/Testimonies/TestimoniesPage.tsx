import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { TestimoniesContent } from 'components/Testimonies/TestimoniesContent';
import { TestimoniesFilters } from 'components/Testimonies/TestimoniesFilters';
import { isEmpty } from 'lodash';
import { useTestimoniesResource } from './useTestimoniesResource';

export function TestimoniesPage() {
  const testimonyResourceQuery = useTestimoniesResource();

  return (
    <PageLayout title="Testimonies" subtitle="Suspect Testimony Rates">
      <Layout hasSider>
        <PageSider>
          <TestimoniesFilters {...testimonyResourceQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={testimonyResourceQuery.isLoading}
            error={testimonyResourceQuery.error}
            hasResponseData={!isEmpty(testimonyResourceQuery.data)}
          >
            <TestimoniesContent {...testimonyResourceQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default TestimoniesPage;
