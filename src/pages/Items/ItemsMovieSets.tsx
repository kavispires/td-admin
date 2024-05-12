import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsMoviesFilters } from 'components/Items/ItemsMoviesFilters';
import { ItemsMoviesTable } from 'components/Items/ItemsMoviesTable';
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
            <ItemsMoviesTable {...moviesData} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsMovieSets;
