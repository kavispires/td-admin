import { Button, Divider, Flex, Input, Space, Tag, Typography } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { cloneDeep, sample, sampleSize, shuffle } from 'lodash';
import { useMemo, useState } from 'react';
import type { Item, MovieCard, MovieGenres, SuspectCard, TestimonyQuestionCard } from 'types';
import { ActorRole } from './ActorRole';

export type FeatureFilRole = {
  actor: SuspectCard;
  traits: string[];
  id: string;
  title: DualLanguageValue;
  description: DualLanguageValue;
  complexity: number;
  pool: number;
  type: string;
};

export type FeatureFilm = {
  movieTitle: string;
  genre: { id: string; name: DualLanguageValue; rating: number; rolesIds: string[] };
  subGenre: { id: string; name: DualLanguageValue; rating: number; rolesIds: string[] };
  castingRoles: FeatureFilRole[];
  features: { id: string; name: DualLanguageValue; probability: number; rating: number }[];
  rating: number;
  props: Item[];
};

type FeatureFilmViewProps = {
  movieTitles: MovieCard[];
  movieGenres: MovieGenres;
  movieActors: SuspectCard[];
  characterTraits: TestimonyQuestionCard[];
  items: Item[];
  language: Language;
};

export function FeatureFilmView({
  movieTitles,
  movieGenres,
  movieActors,
  characterTraits,
  items,
  language,
}: FeatureFilmViewProps) {
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
    setFeatureFilm(buildFeatureFilm(movieTitles, movieGenres, movieActors, characterTraits, items));

  return (
    <>
      <Button onClick={onCreateFeatureFilm}>Create Feature Film</Button>

      {!!featureFilm && (
        <>
          <Typography.Title level={2}>{featureFilm.movieTitle || '?'}</Typography.Title>
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

          <Space style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'flex-start' }}>
            {featureFilm.castingRoles.map((role) => (
              <ActorRole key={role.id} role={role} language={language} />
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
    </>
  );
}

const buildFeatureFilm = (
  movieTitles: MovieCard[],
  movieGenres: MovieGenres,
  movieActors: SuspectCard[],
  characterTraits: TestimonyQuestionCard[],
  items: Item[],
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
  const features: MovieGenres['features'][keyof MovieGenres['features']][] = [];
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
      ', ',
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
  quantity: number,
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
  return id.split('-').join('-gb-');
}
