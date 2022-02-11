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

  const result = parseEspiao();

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

const db = [
  {
    question: "Who's your boss?",
    FIELD2: '',
  },
  {
    question: "What's the biggest thrill you have ever had at work?",
    FIELD2: '',
  },
  {
    question: 'Sorry',
    FIELD2: ' but who are you again?',
  },
  {
    question: 'What is the Pension Plan like with your job?',
    FIELD2: '',
  },
  {
    question: 'Do you think this place is dangerous?',
    FIELD2: '',
  },
  {
    question: 'How did you get here today?',
    FIELD2: '',
  },
  {
    question: 'How long did it take you to get here today?',
    FIELD2: '',
  },
  {
    question: 'What do you see out the window?',
    FIELD2: '',
  },
  {
    question: "What's your favorite perk of the job?",
    FIELD2: '',
  },
  {
    question: 'What would it take for me to do your job?',
    FIELD2: '',
  },
  {
    question: 'Is this an old building?',
    FIELD2: '',
  },
  {
    question: "Who's that?",
    FIELD2: '',
  },
  {
    question: 'Apart from me',
    FIELD2: ' who was the last person you spoke to?',
  },
  {
    question: 'How was your ride to work this morning?',
    FIELD2: '',
  },
  {
    question: 'What time was your last break?',
    FIELD2: '',
  },
  {
    question: 'Do they work shifts here?',
    FIELD2: '',
  },
  {
    question: 'If I told you <insert name here> was the spy',
    FIELD2: ' would you be surprised?',
  },
  {
    question: "What's that in your hand?",
    FIELD2: '',
  },
  {
    question: "What's that in your other hand?",
    FIELD2: '',
  },
  {
    question: 'What was your last Christmas party like?',
    FIELD2: '',
  },
  {
    question: 'What did you eat for lunch today?',
    FIELD2: '',
  },
  {
    question: 'What are your responsibilities?',
    FIELD2: '',
  },
  {
    question: "What's that alarm?",
    FIELD2: '',
  },
  {
    question: 'What is your biggest workday challenge?',
    FIELD2: '',
  },
  {
    question: 'What is the most satisfying part of your job?',
    FIELD2: '',
  },
  {
    question: 'What are the employee benefits of working here?',
    FIELD2: '',
  },
  {
    question: "What's your notice period?",
    FIELD2: '',
  },
  {
    question: 'Why did your predecessor quit?',
    FIELD2: '',
  },
  {
    question: "Who's that in the corner?",
    FIELD2: '',
  },
  {
    question: "What's that in the corner?",
    FIELD2: '',
  },
  {
    question: "What's next door?",
    FIELD2: '',
  },
  {
    question: 'What does it say in the window?',
    FIELD2: '',
  },
  {
    question: "What's the biggest problem with what you're wearing?",
    FIELD2: '',
  },
  {
    question: 'What magazines do you subscribe to?',
    FIELD2: '',
  },
  {
    question: 'If you are the spy',
    FIELD2: ' what would your code name be?',
  },
  {
    question: 'What is your favorite piece of workplace furniture?',
    FIELD2: '',
  },
  {
    question: 'If I got covered in oil',
    FIELD2: ' what would you think?',
  },
  {
    question: "What's your next promotion?",
    FIELD2: '',
  },
  {
    question: 'Who is your most irritating co-worker?',
    FIELD2: '',
  },
  {
    question: "What's that smell? ",
    FIELD2: '',
  },
  {
    question: 'What Time Does Your Job End?',
    FIELD2: '',
  },
  {
    question: 'What Are Your Ambitions Here?',
    FIELD2: '',
  },
  {
    question: 'How Would You Describe The People Around You?',
    FIELD2: '',
  },
  {
    question: 'Sorry',
    FIELD2: ' But Who Are You Again?',
  },
  {
    question: 'Why Did You Speak To The Last Person You Spoke To?',
    FIELD2: '',
  },
  {
    question: "What's Your Favorite Type of Table?",
    FIELD2: '',
  },
  {
    question: 'What Tool Do You Use Most In Your Job?',
    FIELD2: '',
  },
  {
    question: 'Would you bring your family here?',
    FIELD2: '',
  },
  {
    question: 'What brings you here today?',
    FIELD2: '',
  },
  {
    question: 'Why would you recommend this place to a friend?',
    FIELD2: '',
  },
];
