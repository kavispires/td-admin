import { Alert, Divider, Input, Layout, PageHeader, Typography, List } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useAsync, useTitle } from 'react-use';
import DataLoading from '../components/DataLoading';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';

const { Text, Title } = Typography;

const parseData = (cards, groups) => {
  const themes = Object.values(groups)
    .map((entry) => entry.theme)
    .sort();

  const used = {};
  const unused = {};
  const duplicated = {};
  // Get used and unused
  Object.values(groups).forEach((group) => {
    Object.keys(group.cards).forEach((entryId) => {
      if (used[entryId]) {
        duplicated[entryId] = cards[entryId].text;
      } else {
        used[entryId] = cards[entryId].text;
      }
    });
  });

  Object.values(cards).forEach((card) => {
    if (used[card.id] === undefined) {
      unused[card.id] = card.text;
    }
  });

  return { themes, used, unused, duplicated };
};

function Level4() {
  useTitle('Arte Ruim - Level 4');
  const history = useHistory();

  const [used, setUsed] = useState({});
  const [unused, setUnused] = useState({});
  const [duplicated, setDuplicated] = useState({});
  const [themes, setThemes] = useState([]);

  const resourceName = 'arte-ruim';
  const language = 'pt';

  const {
    value: cards,
    loading: loadingCards,
    error: errorCards,
  } = useAsync(async () => {
    const response = await fetch(`${LOCALHOST_RESOURCE_URL}/${resourceName}-${language}.json`);
    const result = await response.json();

    return result;
  }, []);

  const {
    value: groups,
    loading: loadingLevel4,
    error: errorLevel4,
  } = useAsync(async () => {
    const response = await fetch(`${LOCALHOST_RESOURCE_URL}/${resourceName}-extra-${language}.json`);
    const result = await response.json();

    return result;
  }, []);

  useEffect(() => {
    if (cards && groups) {
      const result = parseData(cards, groups);
      setThemes(result.themes);
      setUsed(result.used);
      setUnused(result.unused);
      setDuplicated(result.duplicated);
    }
  }, [cards, groups]);

  return (
    <Layout>
      <PageHeader title="Arte Ruim Level 4" onBack={() => history.goBack()} />

      {Boolean(cards && groups) && (
        <Alert
          type="success"
          message={`Data loaded for ${resourceName}-${language}`}
          className="with-margin"
        />
      )}
      <Divider />

      <Layout.Content className="content">
        <DataLoading loading={loadingCards || loadingLevel4} error={errorCards || errorLevel4}>
          <div className="parser-container">
            <div className="parser-main">
              <Title level={2}>Used in Groups ({Object.keys(used).length})</Title>
              <Input.TextArea
                name="output"
                id=""
                cols="15"
                rows="10"
                readOnly
                value={JSON.stringify(used, null, 4)}
              />
              <Title level={2}>Unused in Groups ({Object.keys(unused).length})</Title>
              <Input.TextArea
                name="output"
                id=""
                cols="15"
                rows="10"
                readOnly
                value={JSON.stringify(unused, null, 4)}
              />
              <Title level={2}>In More than One Group ({Object.keys(duplicated).length})</Title>
              <Input.TextArea
                name="duplicates"
                id=""
                cols="15"
                rows="5"
                readOnly
                value={JSON.stringify(duplicated)}
              />
            </div>

            <aside className="parser-controls">
              <List
                header={<Title level={2}>Themes</Title>}
                bordered
                dataSource={themes}
                renderItem={(item) => (
                  <List.Item>
                    <Text mark></Text> {item}
                  </List.Item>
                )}
              />

              <Divider />

              {/* <div className="parser-flex-column">
                <Title level={2}>Search Similar</Title>
                <Input type="text" onChange={onSearchSimilar} placeholder="Type here" />
                <Input.TextArea
                  name="search-results"
                  id=""
                  cols="10"
                  rows="10"
                  readOnly
                  value={JSON.stringify(searchResults, null, 4)}
                />
              </div> */}
            </aside>
          </div>
        </DataLoading>
      </Layout.Content>
    </Layout>
  );
}

export default Level4;
