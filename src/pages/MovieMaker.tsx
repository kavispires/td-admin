import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResponseState } from 'components/Common';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource, useTDResourceNonCollection } from 'hooks/useTDResource';
import { Item, MovieCard, MovieGenres, SuspectCard, TestimonyQuestionCard } from 'types';
import { FeatureFilmView } from 'components/Movie/FeatureFilmView';

function MovieMaker() {
  const { queryParams } = useQueryParams({ language: 'pt' });
  const language = (queryParams.get('language') ?? 'pt') as Language;
  // Gather movie title
  const movieTitleQuery = useTDResource<MovieCard>(`movies-${language}`);
  // Gather movie genres
  const movieGenresQuery = useTDResourceNonCollection<MovieGenres>('movie-genres');
  // Gather movie actors
  const movieActorsQuery = useTDResource<SuspectCard>('suspects');
  // Gather character traits
  const characterTraitsQuery = useTDResource<TestimonyQuestionCard>(`testimony-questions-${language}`);
  // Gather items
  const itemsQuery = useTDResource<Item>('items');

  const hasResponseData =
    movieTitleQuery.hasResponseData &&
    movieGenresQuery.hasResponseData &&
    movieActorsQuery.hasResponseData &&
    itemsQuery.hasResponseData &&
    characterTraitsQuery.hasResponseData;
  const isLoading =
    movieTitleQuery.isLoading ||
    movieGenresQuery.isLoading ||
    movieActorsQuery.isLoading ||
    itemsQuery.isLoading ||
    characterTraitsQuery.isLoading;
  const error =
    movieTitleQuery.error || movieGenresQuery.error || movieActorsQuery.error || characterTraitsQuery.error;

  // const roleStats = useMemo(() => {
  //   const roleStats: Record<string, number> = {};

  //   Object.values(movieGenresQuery.data?.roles ?? {}).forEach((role) => {
  //     roleStats[role.id] = 0;
  //   });

  //   Object.values(movieGenresQuery.data?.genres ?? {}).forEach((genre) => {
  //     genre.rolesIds.forEach((roleId) => {
  //       roleStats[roleId]++;
  //     });
  //   });

  //   Object.values(movieGenresQuery.data?.subGenres ?? {}).forEach((genre) => {
  //     genre.rolesIds.forEach((roleId) => {
  //       roleStats[roleId]++;
  //     });
  //   });
  //   return roleStats;
  // }, [movieGenresQuery.data]);

  return (
    <PageLayout title="Movie Maker">
      <Layout hasSider>
        <PageSider>
          <ResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper hasResponseData={hasResponseData} isLoading={isLoading} error={error}>
            <FeatureFilmView
              movieTitles={Object.values(movieTitleQuery.data)}
              movieGenres={movieGenresQuery.data!}
              movieActors={Object.values(movieActorsQuery.data)}
              characterTraits={Object.values(characterTraitsQuery.data)}
              items={Object.values(itemsQuery.data)}
              language={language}
            />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default MovieMaker;
