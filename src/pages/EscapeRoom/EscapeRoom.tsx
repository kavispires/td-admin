import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { EscapeRoomContent } from 'components/EscapeRoom/EscapeRoomContent';
import { EscapeRoomFilters } from 'components/EscapeRoom/EscapeRoomFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { isEmpty } from 'lodash';
import { useEscapeRoomResource } from './useEscapeRoomResource';

export function EscapeRoom() {
  const escapeRoomQuery = useEscapeRoomResource();

  return (
    <PageLayout subtitle="Create, Edit, and Verify Missions" title="Escape Room Manager">
      <Layout hasSider>
        <PageSider>
          <EscapeRoomFilters {...escapeRoomQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={escapeRoomQuery.error}
            hasResponseData={!isEmpty(escapeRoomQuery.data)}
            isLoading={escapeRoomQuery.isLoading}
          >
            <EscapeRoomContent {...escapeRoomQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default EscapeRoom;
