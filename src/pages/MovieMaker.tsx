import { ColumnHeightOutlined, ColumnWidthOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Input, Layout, Space, Tag, Typography } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCard } from 'components/Images/ImageCard';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResponseState } from 'components/Common';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource, useTDResourceNonCollection } from 'hooks/useTDResource';
import { cloneDeep, sample, sampleSize, shuffle } from 'lodash';
import { useMemo, useState } from 'react';
import { Item, MovieCard, MovieGenres, SuspectCard, TestimonyQuestionCard } from 'types';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

type FeatureFilm = {
  movieTitle: string;
  genre: { id: string; name: DualLanguageValue; rating: number; rolesIds: string[] };
  subGenre: { id: string; name: DualLanguageValue; rating: number; rolesIds: string[] };
  castingRoles: {
    actor: SuspectCard;
    traits: string[];
    id: string;
    title: DualLanguageValue;
    description: DualLanguageValue;
    complexity: number;
    pool: number;
    type: string;
  }[];
  features: { id: string; name: DualLanguageValue; probability: number; rating: number }[];
  rating: number;
  props: Item[];
};

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
  // Build prompt

  const [cardWidth] = useCardWidth(8);

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

  const [featureFilm, setFeatureFilm] = useState<FeatureFilm>({
    movieTitle: '',
    genre: { id: '', name: { pt: '', en: '' }, rating: 0, rolesIds: [] },
    subGenre: { id: '', name: { pt: '', en: '' }, rating: 0, rolesIds: [] },
    castingRoles: [],
    features: [],
    rating: 0,
    props: [],
  });

  const moviePrompt = useMemo(() => buildMoviePrompt(featureFilm), [featureFilm]);
  const tvShowPrompt = useMemo(() => buildTVSeriesPrompt(featureFilm), [featureFilm]);

  const onCreateFeatureFilm = () =>
    setFeatureFilm(
      buildFeatureFilm(
        Object.values(movieTitleQuery.data),
        movieGenresQuery.data!,
        Object.values(movieActorsQuery.data),
        Object.values(characterTraitsQuery.data),
        Object.values(itemsQuery.data)
      )
    );

  return (
    <PageLayout title="Movie Maker">
      <Layout hasSider>
        <PageSider>
          <ResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper hasResponseData={hasResponseData} isLoading={isLoading} error={error}>
            {/* <Typography.Title level={2}>
              Genres: {Object.values(movieGenresQuery.data?.genres ?? {}).length} | Sub-genres:{' '}
              {Object.values(movieGenresQuery.data?.subGenres ?? {}).length} | Roles:{' '}
              {Object.values(movieGenresQuery.data?.roles ?? {}).length} | Features:{' '}
              {Object.values(movieGenresQuery.data?.features ?? {}).length}
            </Typography.Title>

            <Space direction="vertical">
              <ul>
                {Object.values(movieGenresQuery.data?.roles ?? {}).map((role) => (
                  <li key={role.id}>
                    {role.id} ({roleStats[role.id]})<CopyToClipboardButton content={`"${role.id}", `} />
                  </li>
                ))}
              </ul>
            </Space> */}

            <Button onClick={onCreateFeatureFilm}>Create Feature Film</Button>

            {Boolean(featureFilm) && (
              <>
                <Typography.Title level={2}>{featureFilm!.movieTitle || '?'}</Typography.Title>
                <Typography.Paragraph>
                  <strong>Genre:</strong> {featureFilm.genre.name[language]}
                  <br />
                  <strong>Sub-genre:</strong> {featureFilm.subGenre.name[language]}
                  <br />
                  <strong>Rating:</strong> {featureFilm.rating}
                  <br />
                  {
                    <Flex>
                      <strong>Features:</strong>
                      {featureFilm.features.map((feature) => (
                        <Tag key={feature.id}>{feature.name[language]}</Tag>
                      ))}
                    </Flex>
                  }
                  {
                    <Flex>
                      <strong>Key Objects:</strong>
                      {featureFilm.props.map((item) => (
                        <Tag key={item.id}>{item.name[language]}</Tag>
                      ))}
                    </Flex>
                  }
                </Typography.Paragraph>

                <Space
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'flex-start' }}
                >
                  {featureFilm.castingRoles.map((role) => (
                    <div key={role.id}>
                      <Typography.Title level={3}>{role.title[language]}</Typography.Title>
                      <div className="suspect" style={{ width: `${cardWidth}px` }}>
                        <ImageCard id={role.actor.id} width={cardWidth} className="suspect__image" />

                        <div className="suspect__name">
                          <div>
                            <Tag>{role.actor.id}</Tag>
                          </div>
                          <div>🇧🇷 {role.actor.name.pt}</div>
                          <div>🇺🇸 {role.actor.name.en}</div>
                          <div className="suspect__info">
                            <div>
                              <div>
                                {role.actor.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}{' '}
                                {role.actor.age}
                              </div>
                              <div>
                                <em>{role.actor.ethnicity}</em>
                              </div>
                            </div>
                            <div>
                              <ColumnWidthOutlined />
                              <br />
                              {role.actor.build}
                            </div>
                            <div>
                              <ColumnHeightOutlined />
                              <br />
                              {role.actor.height}
                            </div>
                          </div>
                        </div>
                      </div>

                      <br />
                      <strong>Traits:</strong>
                      <ul>
                        {role.traits.map((trait) => (
                          <li key={trait}>{trait}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Space>

                <Divider />

                <Typography.Title level={2}>
                  Movie Prompt <CopyToClipboardButton content={moviePrompt} />
                </Typography.Title>
                <Input.TextArea value={moviePrompt} autoSize={{ minRows: 3, maxRows: 10 }} />

                <Typography.Title level={2}>
                  TV Series Prompt <CopyToClipboardButton content={tvShowPrompt} />
                </Typography.Title>
                <Input.TextArea value={tvShowPrompt} autoSize={{ minRows: 3, maxRows: 10 }} />
              </>
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default MovieMaker;

const buildFeatureFilm = (
  movieTitles: MovieCard[],
  movieGenres: MovieGenres,
  movieActors: SuspectCard[],
  characterTraits: TestimonyQuestionCard[],
  items: Item[]
): FeatureFilm => {
  // Define title
  const movieTitle = sampleSize(movieTitles, 2)
    .map((title, index) => {
      return index % 2 === 0 ? title.prefix : title.suffix;
    })
    .join(' ');

  // Rating
  let rating = 0;

  // Define genre
  const selectedGenre = sample(Object.values(movieGenres.genres ?? {}));
  if (!selectedGenre) {
    throw new Error('No genre found');
  }
  rating += selectedGenre.rating;

  // Define sub-genres
  const selectedSubGenre = sample(Object.values(movieGenres.subGenres ?? {}));
  if (!selectedSubGenre) {
    throw new Error('No sub-genre found');
  }
  rating += selectedSubGenre.rating;

  // Define features
  let features: MovieGenres['features'][keyof MovieGenres['features']][] = [];
  Object.values(movieGenres.features ?? {}).forEach((feature) => {
    const hasFeature = Math.random() < feature.probability;

    if (hasFeature) {
      features.push(feature);
      rating += feature.rating;
    }
  });

  // Define roles
  const preselectedRoles: MovieGenres['roles'][keyof MovieGenres['roles']][] = [];
  selectedGenre.rolesIds.forEach((roleId) => {
    preselectedRoles.push(movieGenres.roles[roleId]);
  });
  selectedSubGenre.rolesIds.forEach((roleId) => {
    preselectedRoles.push(movieGenres.roles[roleId]);
  });
  const roles = getFirstNUniqueRoles(preselectedRoles, 5);

  const selectedActors = sampleSize(movieActors, roles.length);
  const shuffledTraits = cloneDeep(shuffle(characterTraits));

  // Define traits
  const castingRoles = roles.map((role, index) => {
    return {
      ...role,
      actor: { ...selectedActors[index], id: getSuspectCTId(selectedActors[index].id) },
      traits: shuffledTraits.splice(0, role.complexity).map((trait) => trait.answer),
    };
  });

  // Define actors

  return {
    movieTitle,
    genre: selectedGenre,
    subGenre: selectedSubGenre,
    castingRoles,
    features,
    rating,
    props: sampleSize(items, 8),
  };
};

const buildMoviePrompt = (movie: FeatureFilm) => {
  let prompt = `Escreva o resumo de um filme de ${movie.genre.name.pt}/${movie.subGenre.name.pt} entitulado "${movie.movieTitle}"`;

  if (movie.features.length > 0) {
    prompt += ` que contenha os seguintes elementos: ${movie.features.map((item) => item.name.pt).join(', ')}`;
  }

  prompt += `. Incorpore os personagens as suas características na trama, seja criativo e também incorpore esses objetos na trama: ${movie.props
    .slice(0, 3)
    .map((item) => item.name.pt)
    .join(
      ', '
    )}. Para a idade, escolha um número aleatório dentre a faixa dada, por exemplo 20-30, diga 26 anos. Não use parenteses no texto. Adicione um plot twist inesperado. Aqui vão os personagens: \n`;

  movie.castingRoles.forEach((role) => {
    prompt += `\n${role.title.pt}: ${role.actor.name.pt.split(' ')[0]}, ${role.actor.age} anos, ${genders[role.actor.gender]}, ${ethnicity[role.actor.ethnicity]}, com as características: ${role.traits.join(', ')}.\n`;
  });

  return prompt;
};

const buildTVSeriesPrompt = (movie: FeatureFilm) => {
  let prompt = `Escreva o resumo de cada um dos 8 episódios dá série de ${movie.genre.name.pt}/${movie.subGenre.name.pt} entitulada "${movie.movieTitle}"`;

  if (movie.features.length > 0) {
    prompt += ` que contenha os seguintes elementos: ${movie.features.map((item) => item.name.pt).join(', ')}`;
  }

  prompt += `. Incorpore o título da série e todos os personagens as suas características na trama, seja criativo e também incorpore esses objetos na trama: ${movie.props.map((item) => item.name.pt).join(', ')}. Para a idade, escolha um número aleatório dentre a faixa dada, por exemplo 20-30, diga 26 anos. Não use parenteses no texto. Cada episódio deve terminar com um cliffhanger e o próximo episódio deve continuar desse cliffhanger. Aqui vão os personagens: \n`;

  movie.castingRoles.forEach((role) => {
    prompt += `\n${role.title.pt}: ${role.actor.name.pt.split(' ')[0]}, ${role.actor.age} anos, ${genders[role.actor.gender]}, ${ethnicity[role.actor.ethnicity]}, com as características: ${role.traits.join(', ')}.\n`;
  });

  return prompt;
};

const genders: StringDictionary = {
  female: 'mulher',
  male: 'homem',
};
const ethnicity: StringDictionary = {
  asian: 'asiático',
  black: 'negro',
  caucasian: 'branco',
  latino: 'latino',
  mixed: 'mestiço',
  'middle-eastern': 'oriente-médio',
  'native-american': 'nativo-americano',
  indian: 'indiano',
};

function getFirstNUniqueRoles(
  roles: MovieGenres['roles'][keyof MovieGenres['roles']][],
  quantity: number
): MovieGenres['roles'][keyof MovieGenres['roles']][] {
  const uniqueRoles: MovieGenres['roles'][keyof MovieGenres['roles']][] = [];
  const seenIds = new Set<string>();

  for (const role of roles) {
    if (!seenIds.has(role.id)) {
      uniqueRoles.push(role);
      seenIds.add(role.id);

      if (uniqueRoles.length === quantity) {
        break;
      }
    }
  }

  return uniqueRoles;
}

function getSuspectCTId(id: string) {
  return id.split('-').join('-ct-');
}
