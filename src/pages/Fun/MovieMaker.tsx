import { Layout } from 'antd';
import { ResponseState } from 'components/Common';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { FeatureFilmView } from 'components/Movie/FeatureFilmView';
import { FeatureFilmViewV2 } from 'components/Movie/FeatureFilmViewV2';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource, useTDResourceNonCollection } from 'hooks/useTDResource';
import type {
  ItemData,
  MovieCardData,
  MovieGenres,
  SuspectCardData,
  SuspectExtendedInfoData,
  TestimonyQuestionCardData,
} from 'types';

function MovieMaker() {
  const { queryParams } = useQueryParams({ language: 'pt' });
  const language = (queryParams.get('language') ?? 'pt') as Language;
  // Gather movie title
  const movieTitleQuery = useTDResource<MovieCardData>(`movies-${language}`);
  // Gather movie genres
  const movieGenresQuery = useTDResourceNonCollection<MovieGenres>('movie-genres');
  // Gather movie actors
  const movieActorsQuery = useTDResource<SuspectCardData>('suspects');
  // Gather extended info about suspects
  const suspectsExtendedQuery = useTDResource<SuspectExtendedInfoData>('suspects-extended-info');
  // Gather character traits
  const characterTraitsQuery = useTDResource<TestimonyQuestionCardData>(`testimony-questions-${language}`);
  // Gather items
  const itemsQuery = useTDResource<ItemData>('items');

  const hasResponseData =
    movieTitleQuery.hasResponseData &&
    movieGenresQuery.hasResponseData &&
    movieActorsQuery.hasResponseData &&
    suspectsExtendedQuery.hasResponseData &&
    itemsQuery.hasResponseData &&
    characterTraitsQuery.hasResponseData;
  const isLoading =
    movieTitleQuery.isLoading ||
    movieGenresQuery.isLoading ||
    movieActorsQuery.isLoading ||
    suspectsExtendedQuery.isLoading ||
    itemsQuery.isLoading ||
    characterTraitsQuery.isLoading;
  const error =
    movieTitleQuery.error ||
    movieGenresQuery.error ||
    movieActorsQuery.error ||
    suspectsExtendedQuery.error ||
    itemsQuery.error ||
    characterTraitsQuery.error;

  return (
    <PageLayout title="Movie Maker">
      <Layout hasSider>
        <PageSider>
          <ResponseState
            error={error}
            hasResponseData={hasResponseData}
            isLoading={isLoading}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={error}
            hasResponseData={hasResponseData}
            isLoading={isLoading}
          >
            {movieGenresQuery.data && (
              <FeatureFilmViewV2
                actorsExtendedInfo={suspectsExtendedQuery.data ?? {}}
                characterTraits={characterTraitsQuery.data ?? {}}
                items={itemsQuery.data}
                language={language}
                movieActors={movieActorsQuery.data ?? {}}
                movieGenres={movieGenresQuery.data}
                movieTitles={movieTitleQuery.data ?? {}}
              />
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default MovieMaker;
