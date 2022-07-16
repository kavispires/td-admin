/* eslint-disable no-unused-vars */
import { Alert, Divider, Input, Layout, PageHeader, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { useAsync, useTitle } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';

const { Text, Title } = Typography;

function Other() {
  useTitle('Arte Ruim - Other');

  // const result = Array(50)
  //   .fill(1)
  //   .reduce((acc, e, index) => {
  //     const num = e + index;
  //     const idNum = num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
  //     const id = `md-rb-${idNum}`;

  //     acc[id] = {
  //       id,
  //       orientation: 'vertical',
  //     };

  //     return acc;
  //   }, {});

  // const result = Object.entries(data).reduce((acc, [id, value]) => {
  //   acc[id] = {
  //     id: value.id,
  //     name: {
  //       pt: value.pt,
  //       en: value.en,
  //     },
  //     gender: value.gender,
  //   };
  //   return acc;
  // }, {});

  // const result = Object.entries(SUSPECTS_NAMES).reduce((acc, [id, value]) => {
  //   if (!value.gender) throw Error(`a, id ${id}`);
  //   acc[id] = {
  //     id,
  //     ...value,
  //   };

  //   return acc;
  // }, {});

  const makeCrimesHediondosEnries = (quantity, startingId = 0, type) => {
    return Array(quantity)
      .fill(startingId)
      .reduce((acc, e, index) => {
        const num = e + index;
        const idNum = num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
        const id = `dmhk-${type}-${idNum}`;

        acc[id] = {
          id,
          type: type === 'wp' ? 'weapon' : 'evidence',
          name: {
            en: '',
            pt: '',
          },
        };

        return acc;
      }, {});
  };

  // const result = makeCrimesHediondosEnries(200, 66, 'ev');

  const convertCsvJsonSceneTiles = (d) => {
    return d.map((e) => {
      const entry = {
        title: {},
        values: [],
      };

      Object.entries(e).forEach(([key, value]) => {
        const [category, language] = key.split('-');

        if (!language) {
          entry[key] = value;
          return;
        }

        if (category === 'title') {
          entry.title[language] = value;
          return;
        }

        if (category.startsWith('value')) {
          const index = Number(category.substring(5));
          if (entry.values[index] === undefined) {
            entry.values[index] = {};
          }
          entry.values[index][language] = value;
          return;
        }

        console.log({ [key]: value });
      });

      return entry;
    });
  };

  const convertToDualLanguage = (d) => {
    return Object.values(d).reduce((acc, entry) => {
      acc[entry.id] = {
        id: entry.id,
        type: entry.type,
        name: {
          en: entry.en,
          pt: entry.pt,
        },
      };
      return acc;
    }, {});
  };
  // const result = convertToDualLanguage(data);

  const parseEspiao = () => {
    const cache = {};

    db.forEach((entry) => {
      if (cache[entry.location] === undefined) {
        cache[entry.location] = [];
      }
      cache[entry.location].push(entry.role);
    });

    return Object.entries(cache).reduce((acc, [location, roles], index) => {
      const idNum = index + 1 < 10 ? `0${index + 1}` : index + 1;
      const id = `e-${idNum}-en`;
      acc[id] = {
        id,
        name: location,
        roles: roles,
      };

      return acc;
    }, {});
  };

  // const result = parseEspiao();

  const parseLinhasCruzadas = () => {
    return db.reduce((acc, entry, index) => {
      const id = `lc-${index + 1}-pt`;
      acc[id] = {
        id,
        text: entry.text,
      };
      return acc;
    }, {});
  };

  // const result = parseLinhasCruzadas();

  const parseGaleriaDeSonhos = () => {
    return rawData.reduce((acc, entry, index) => {
      const id = `gs-${index + 1}-pt`;
      acc[id] = {
        id,
        text: entry.text,
      };
      return acc;
    }, {});
  };

  // const result = parseGaleriaDeSonhos();

  const parseCategories = () => {
    return rawData.reduce((acc, entry, index) => {
      const id = `ct-${index + 1}-pt`;
      acc[id] = {
        id,
        text: entry.category,
      };
      return acc;
    }, {});
  };

  // const result = parseCategories();

  // const parseInspirations = () => {
  //   return rawData.reduce((acc, entry, index) => {
  //     const id = `mui-${index + 1}-pt`;
  //     acc[id] = {
  //       id,
  //       text: entry.text,
  //       level: entry.level,
  //       set: entry.set,
  //     };
  //     return acc;
  //   }, {});
  // };

  // const result = parseInspirations();

  // const parseAdjectives = () => {
  //   return rawData.reduce((acc, entry, index) => {
  //     const id = `adj-${index + 1}-pt`;
  //     acc[id] = {
  //       id,
  //       text: entry.texto,
  //     };
  //     return acc;
  //   }, {});
  // };

  // const result = parseAdjectives();

  const parsePairs = () => {
    return rawData.reduce((acc, entry, index) => {
      const id = `ap-${index + 1}-pt`;
      acc[id] = {
        id,
        values: [entry.CARD_1, entry.CARD_2],
      };
      return acc;
    }, {});
  };

  const result = parsePairs();

  return (
    <Layout>
      <PageHeader title="Other" onBack={() => {}} />

      <Divider />

      <Layout.Content className="content">
        <div className="a">
          <Input.TextArea
            name="search-results"
            id=""
            cols="10"
            rows="10"
            readOnly
            value={JSON.stringify(result, null, 4)}
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default Other;

function parse(a) {
  return a.map((v) => {
    if (v.FIELD2) return `${v.question}, ${v.FIELD2}`;
    return v.question;
  });
}

const db = [];

const rawData = [
  {
    CARD_1: 'lápis',
    CARD_2: 'caneta',
  },
  {
    CARD_1: 'giz',
    CARD_2: 'giz de ceira',
  },
  {
    CARD_1: 'ônibus',
    CARD_2: 'van',
  },
  {
    CARD_1: 'dentista',
    CARD_2: 'médico',
  },
  {
    CARD_1: 'jardineiro',
    CARD_2: 'encanador',
  },
  {
    CARD_1: 'professor',
    CARD_2: 'treinador',
  },
  {
    CARD_1: 'fantoche',
    CARD_2: 'marionete',
  },
  {
    CARD_1: 'boneca',
    CARD_2: 'criança',
  },
  {
    CARD_1: 'cabra',
    CARD_2: 'ovelha',
  },
  {
    CARD_1: 'lhama',
    CARD_2: 'camelo',
  },
  {
    CARD_1: 'urso',
    CARD_2: 'cachorro',
  },
  {
    CARD_1: 'óculos',
    CARD_2: 'binóculos',
  },
  {
    CARD_1: 'pá',
    CARD_2: 'colher',
  },
  {
    CARD_1: 'quarto',
    CARD_2: 'sala de estar',
  },
  {
    CARD_1: 'banheira',
    CARD_2: 'privada',
  },
  {
    CARD_1: 'laço',
    CARD_2: 'pular corda',
  },
  {
    CARD_1: 'escova de dentes',
    CARD_2: 'escova de cabelo',
  },
  {
    CARD_1: 'submarino',
    CARD_2: 'navio pirata',
  },
  {
    CARD_1: 'nadar',
    CARD_2: 'afogar',
  },
  {
    CARD_1: 'bolo',
    CARD_2: 'pão',
  },
  {
    CARD_1: 'fruta',
    CARD_2: 'verdura',
  },
  {
    CARD_1: 'Mario',
    CARD_2: 'Luigi',
  },
  {
    CARD_1: 'Tetris',
    CARD_2: 'Vitrais',
  },
  {
    CARD_1: 'Bola de futebol',
    CARD_2: 'Bola de basquete',
  },
  {
    CARD_1: 'Escada',
    CARD_2: 'Trilho do trem',
  },
  {
    CARD_1: 'Fazenda',
    CARD_2: 'Zoológico',
  },
  {
    CARD_1: 'microfone',
    CARD_2: 'sorvete',
  },
];
