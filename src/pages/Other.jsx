/* eslint-disable no-unused-vars */
import { Alert, Divider, Input, Layout, PageHeader, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { useAsync, useTitle } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

const { Text, Title } = Typography;

export function Other() {
  useTitle('Other');

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

  // const parsePairs = () => {
  //   return rawData.reduce((acc, entry, index) => {
  //     const id = `ap-${index + 1}-pt`;
  //     acc[id] = {
  //       id,
  //       values: [entry.CARD_1, entry.CARD_2],
  //     };
  //     return acc;
  //   }, {});
  // };

  // const result = parsePairs();

  // const cache = {};
  // const duplicated = {};
  // const uniqueSingleWords = () => {
  //   const resArr = [];

  //   Object.values(rawData).forEach((entry) => {
  //     const raw = stringRemoveAccents(entry.text).toLowerCase();

  //     if (raw.includes(' ')) {
  //       console.warn('SPACE IN', raw);
  //     }

  //     if (cache[raw]) {
  //       duplicated[raw] = true;
  //     } else {
  //       cache[raw] = true;
  //       resArr.push(entry.text.toLowerCase());
  //     }
  //   });

  //   const sortedArr = resArr.sort((a, b) => a.localeCompare(b));

  //   return sortedArr.reduce((acc, entry, index) => {
  //     const id = `sw-${index + 1}-pt`;
  //     acc[id] = {
  //       id,
  //       text: entry,
  //     };

  //     return acc;
  //   }, {});
  // };
  // const result = uniqueSingleWords();
  // console.log(duplicated);

  // const parseContenders = () =>
  //   rawData.reduce((acc, entry, index) => {
  //     const id = `cnt-${index + 1}`;
  //     const item = {
  //       id,
  //       name: {
  //         en: entry.name_en,
  //         pt: entry.name_pt,
  //       },
  //     };

  //     if (entry.exclusivity) {
  //       item.exclusivity = entry.exclusivity;
  //     }

  //     acc[id] = item;

  //     return acc;
  //   }, {});

  // const result = parseContenders();

  // const parseChallenges = () =>
  //   rawData.reduce((acc, entry, index) => {
  //     const id = `clg-${index + 1}-pt`;
  //     acc[id] = {
  //       id,
  //       text: entry.challenge_pt,
  //     };
  //     return acc;
  //   }, {});

  // const result = parseChallenges();

  const parseQuantitativeQuestions = () =>
    rawData.reduce((acc, entry, index) => {
      const id = `qq-${index + 1}-pt`;
      const e = {
        id,
        question: entry.question,
      };

      if (entry.scale) {
        e.scale = true;
      }

      acc[id] = e;
      return acc;
    }, {});

  const result = parseQuantitativeQuestions();

  const jsonString = useMemo(() => JSON.stringify(result, null, 4), [result]);

  return (
    <Layout>
      <PageHeader title="Other" onBack={() => {}} />

      <Divider />

      <Layout.Content className="content">
        <div className="a">
          <Text>
            Output <CopyToClipboardButton content={jsonString} />
          </Text>

          <Input.TextArea name="search-results" id="" cols="10" rows="10" readOnly value={jsonString} />
        </div>
      </Layout.Content>
    </Layout>
  );
}

function parse(a) {
  return a.map((v) => {
    if (v.FIELD2) return `${v.question}, ${v.FIELD2}`;
    return v.question;
  });
}

const db = [];

const rawData = [];
