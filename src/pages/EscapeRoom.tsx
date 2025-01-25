import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';

import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { EscapeRoomFilters } from 'components/EscapeRoom/EscapeRoomFilters';
import type { EscapeRoomEpisode } from 'components/EscapeRoom/types';
import { Outlet } from 'react-router-dom';

export function EscapeRoom() {
  const episodesQuery = useResourceFirebaseData<EscapeRoomEpisode>({
    tdrResourceName: 'escape-room',
    firebaseDataCollectionName: 'escapeRoom',
    serialize: true,
  });

  return (
    <PageLayout title="Escape Room" subtitle="Episodes">
      <Layout hasSider>
        <PageSider>
          <EscapeRoomFilters {...episodesQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={episodesQuery.isLoading}
            error={episodesQuery.error}
            hasResponseData={!isEmpty(episodesQuery.data)}
          >
            <Outlet context={episodesQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default EscapeRoom;
