import { CopyToClipboardButton } from '@components/CopyToClipboardButton';
import type {
  ItemData,
  MovieCardData,
  MovieGenres,
  SuspectCardData,
  SuspectExtendedInfoData,
  TestimonyQuestionCardData,
} from '@types';
import { Button, Divider, Flex, Input, Space, Tag, Typography } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { ActorRole } from './ActorRole';

export type FeatureFilmRole = {
  actor: SuspectCardData;
  traits: string[];
  persona: DualLanguageValue;
  id: string;
  title: DualLanguageValue;
  description: DualLanguageValue;
  complexity: number;
  pool: number;
  type: string;
};

export type FeatureFilm = {
  movieTitle: string;
  type: 'movie' | 'show';
  genre: MovieGenres['genres'][keyof MovieGenres['genres']];
  subGenre: MovieGenres['subGenres'][keyof MovieGenres['subGenres']];
  castingRoles: FeatureFilmRole[];
  features: MovieGenres['features'][keyof MovieGenres['features']][];
  rating: number;
  props: ItemData[];
  prompt: string;
};

type FeatureFilmViewProps = {
  movieTitles: Dictionary<MovieCardData>;
  movieGenres: MovieGenres;
  movieActors: Dictionary<SuspectCardData>;
  actorsExtendedInfo: Dictionary<SuspectExtendedInfoData>;
  characterTraits: Dictionary<TestimonyQuestionCardData>;
  items: Dictionary<ItemData>;
  language: Language;
};

export function FeatureFilmViewV2({
  movieTitles,
  movieGenres,
  movieActors,
  actorsExtendedInfo,
  characterTraits,
  items,
  language,
}: FeatureFilmViewProps) {
  const [featureFilm, setFeatureFilm] = useState<FeatureFilm | null>(null);

  const onCreateFeatureFilm = () => {
    setFeatureFilm(
      generateFeatureFilm('movie', language, {
        movies: movieTitles,
        genresData: movieGenres,
        suspects: movieActors,
        suspectsExtended: actorsExtendedInfo,
        testimonies: characterTraits,
        items: items,
      }),
    );
  };

  const onCreateTVShow = () => {
    setFeatureFilm(
      generateFeatureFilm('show', language, {
        movies: movieTitles,
        genresData: movieGenres,
        suspects: movieActors,
        suspectsExtended: actorsExtendedInfo,
        testimonies: characterTraits,
        items: items,
      }),
    );
  };

  return (
    <>
      <Flex
        gap={16}
        wrap
      >
        <Button onClick={onCreateFeatureFilm}>Create Feature Film</Button>
        <Button onClick={onCreateTVShow}>Create TV Show</Button>
      </Flex>

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
              <ActorRole
                key={role.id}
                language={language}
                role={role}
              />
            ))}
          </Space>

          <Divider />

          <Typography.Title level={2}>
            Prompt <CopyToClipboardButton content={featureFilm.prompt} />
          </Typography.Title>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 10 }}
            value={featureFilm.prompt}
          />
        </>
      )}
    </>
  );
}

export function generateFeatureFilm(
  type: 'movie' | 'show',
  lang: 'pt' | 'en',
  db: {
    movies: Record<string, MovieCardData>;
    genresData: MovieGenres;
    suspects: Record<string, SuspectCardData>;
    suspectsExtended: Record<string, SuspectExtendedInfoData>;
    testimonies: Record<string, TestimonyQuestionCardData>;
    items: Record<string, ItemData>;
  },
): FeatureFilm {
  // 1. Gerar Título
  const movieKeys = Object.keys(db.movies);
  const movieTitle = `${db.movies[_.sample(movieKeys)!].prefix} ${db.movies[_.sample(movieKeys)!].suffix}`;

  // 2. Selecionar Gênero, Sub-gênero e Features
  const selectedGenre = db.genresData.genres[_.sample(Object.keys(db.genresData.genres))!];
  const selectedSubGenre = db.genresData.subGenres[_.sample(Object.keys(db.genresData.subGenres))!];
  const selectedFeatures = _.sampleSize(Object.keys(db.genresData.features), _.random(0, 2)).map(
    (k) => db.genresData.features[k],
  );

  const totalRating = selectedGenre.rating + selectedSubGenre.rating + _.sumBy(selectedFeatures, 'rating');

  // 3. Itens (Props)
  const numItems = type === 'show' ? 6 : 2;
  const selectedItems = _.sampleSize(Object.keys(db.items), numItems).map((k) => db.items[k]);

  // 4. Montar Papéis Únicos
  const targetCount = type === 'show' ? 10 : 5;
  const genreRoles = selectedGenre.rolesIds;
  const subGenreRoles = _.difference(selectedSubGenre.rolesIds, genreRoles);
  const allRoleIds = Object.keys(db.genresData.roles);

  const extraRolesPool = _.difference(allRoleIds, [...genreRoles, ...subGenreRoles]);
  const finalRoleIds = [
    ...genreRoles,
    ...subGenreRoles,
    ..._.sampleSize(extraRolesPool, targetCount - (genreRoles.length + subGenreRoles.length)),
  ];

  // 5. Elenco e Traços
  const castKeys = _.sampleSize(Object.keys(db.suspects), finalRoleIds.length);
  const testimonyKeys = Object.keys(db.testimonies);
  const poolMap: Record<string, number> = { small: 1, medium: 2, large: 3 };

  const castingRoles: FeatureFilmRole[] = finalRoleIds.map((roleId, index) => {
    const roleDef = db.genresData.roles[roleId];
    const actor = db.suspects[castKeys[index]];
    const extendedInfo = db.suspectsExtended[actor.id];
    const traits = _.sampleSize(testimonyKeys, roleDef.complexity).map((k) => db.testimonies[k].answer);

    return {
      actor,
      traits,
      persona: extendedInfo?.persona || { en: 'Character', pt: 'Personagem' },
      id: roleDef.id,
      title: roleDef.title,
      description: roleDef.description,
      complexity: roleDef.complexity,
      pool: poolMap[roleDef.pool as unknown as string] || 1,
      type: roleDef.type,
    };
  });

  // 6. Prompt
  const castPrompt = castingRoles
    .map((r) => {
      const extendedInfo = db.suspectsExtended[r.actor.id];

      // Extrai etnia/raça, idade e gênero
      const ethnicityOrRace = extendedInfo?.ethnicity || r.actor.race;
      const age = r.actor.age;
      const gender = r.actor.gender;

      // Filtra valores nulos/indefinidos e junta os dados demográficos disponíveis
      const demographicData = [ethnicityOrRace, age, gender].filter(Boolean).join(', ');
      const demographicsString = demographicData ? ` [${demographicData}]` : '';

      return `\n- **${r.actor.name[lang]}**${demographicsString} (${r.title[lang]}): ${r.description[lang]}. Persona: ${r.persona[lang]}. Traits: ${r.traits.join(', ')}.`;
    })
    .join('');

  const promptLines = [
    lang === 'pt'
      ? `Você é um roteirista premiado. Crie um outline detalhado para um(a) ${type === 'show' ? 'série de TV com 8 episódios' : 'filme'}.`
      : `You are an award-winning screenwriter. Create a detailed outline for a ${type === 'show' ? '8-episode TV show' : 'feature film'}.`,
    `Title: "${movieTitle}"`,
    `Genre: ${selectedGenre.name[lang]} / ${selectedSubGenre.name[lang]}`,
    `Features: ${selectedFeatures.map((f) => f.name[lang]).join(', ')}`,
    '',
    lang === 'pt' ? '**ITENS (Introduza-os gradualmente):**' : '**MANDATORY PROPS (Introduce gradually):**',
    ...selectedItems.map((i) => `- ${i.name[lang]}`),
    '',
    lang === 'pt' ? '**ELENCO (Introduza-os gradualmente):**' : '**CAST (Introduce gradually):**',
    castPrompt,
    '',
    type === 'show'
      ? lang === 'pt'
        ? '**ESTRUTURA:** 8 episódios com introdução gradual.'
        : '**STRUCTURE:** 8 episodes with gradual introduction.'
      : lang === 'pt'
        ? '**ESTRUTURA:** Três atos (Início, Meio, Fim).'
        : '**STRUCTURE:** Three acts (Beginning, Middle, End).',
  ];

  return {
    movieTitle,
    genre: selectedGenre,
    subGenre: selectedSubGenre,
    castingRoles,
    features: selectedFeatures,
    rating: totalRating,
    props: selectedItems,
    prompt: promptLines.join('\n'),
    type,
  };
}
