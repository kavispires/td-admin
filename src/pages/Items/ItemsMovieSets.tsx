import { Layout, Space } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsMoviesFilters } from 'components/Items/Movies/ItemsMoviesFilters';
import { ItemsMoviesSample } from 'components/Items/Movies/ItemsMoviesSample';
import { ItemsMoviesTable } from 'components/Items/Movies/ItemsMoviesTable';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { DailyMovieSet } from 'types';

export function ItemsMovieSets() {
  const moviesData = useResourceFirebaseData<DailyMovieSet>({
    tdrResourceName: 'daily-movie-sets',
    firebaseDataCollectionName: 'movieSets',
  });

  return (
    <PageLayout title="Items" subtitle="Movie Sets">
      <Layout hasSider>
        <PageSider>
          <ItemsMoviesFilters {...moviesData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={moviesData.isLoading}
            error={moviesData.error}
            hasResponseData={!isEmpty(moviesData.data)}
          >
            <Space direction="vertical">
              <ItemsMoviesSample {...moviesData} />
              <ItemsMoviesTable {...moviesData} />
            </Space>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsMovieSets;
