/* eslint-disable no-unused-vars */
import { Alert, Divider, Input, Layout, PageHeader, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { useAsync, useTitle } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';
import DataLoading from '../components/DataLoading';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';

const { Text, Title } = Typography;

function Other() {
  useTitle('Arte Ruim - Other');

  const history = useHistory();

  const result = Array(50)
    .fill(1)
    .reduce((acc, e, index) => {
      const num = e + index;
      const idNum = num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
      const id = `md-rb-${idNum}`;

      acc[id] = {
        id,
        orientation: 'vertical',
      };

      return acc;
    }, {});

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

  return (
    <Layout>
      <PageHeader title="Other" onBack={() => history.goBack()} />

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
