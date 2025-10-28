import { Layout } from 'antd';
import { ArteRuimDrawingsContent } from 'components/ArteRuim/ArteRuimDrawingsContent';
import { ArteRuimDrawingsFilters } from 'components/ArteRuim/ArteRuimDrawingsFilters';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useQueryParams } from 'hooks/useQueryParams';
import { useDrawingsResourceData } from './useArteRuimDrawings';

export function ArteRuimDrawings() {
  const { queryParams } = useQueryParams();
  const language = queryParams.get('language');
  const query = useDrawingsResourceData(!!language && language !== '--', language ?? '--');
  return (
    <PageLayout title="Arte Ruim Drawings">
      <Layout hasSider>
        <PageSider>
          <ArteRuimDrawingsFilters {...query} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={query.error}
            hasResponseData={query.hasResponseData}
            isLoading={query.isLoading}
          >
            <ArteRuimDrawingsContent {...query} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ArteRuimDrawings;
