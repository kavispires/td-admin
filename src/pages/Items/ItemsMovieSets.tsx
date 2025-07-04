import { Layout, Space } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemMoviesListing } from 'components/Items/Movies/ItemMoviesListing';
import { ItemsMoviesSearch } from 'components/Items/Movies/ItemMoviesSearch';
import { ItemsMoviesFilters } from 'components/Items/Movies/ItemsMoviesFilters';
import { ItemsMoviesSample } from 'components/Items/Movies/ItemsMoviesSample';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { DailyMovieSet } from 'types';

export function ItemsMovieSets() {
  const moviesData = useResourceFirestoreData<DailyMovieSet>({
    tdrResourceName: 'daily-movie-sets',
    firestoreDataCollectionName: 'movieSets',
  });

  return (
    <PageLayout subtitle="Movie Sets" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemsMoviesFilters {...moviesData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={moviesData.error}
            hasResponseData={!isEmpty(moviesData.data)}
            isLoading={moviesData.isLoading}
          >
            <Space direction="vertical">
              <ItemsMoviesSearch {...moviesData} />
              <ItemsMoviesSample {...moviesData} />
              <ItemMoviesListing {...moviesData} />
            </Space>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsMovieSets;
