import { Input, Layout, Typography, List } from 'antd';
import { useEffect, useState } from 'react';
import { useAsync, useTitle } from 'react-use';
import { DataLoadingWrapper } from '../../components/DataLoadingWrapper';
import { ResourceSelectionBar } from '../../components/ResourceSelectionBar';
import { useResourceState } from '../../hooks/useResourceState';
import { DEFAULT_LANGUAGE, LOCALHOST_RESOURCE_URL } from '../../utils/constants';

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

  const availableResources = ['arte-ruim'];
  const initialState = { language: DEFAULT_LANGUAGE, resourceName: availableResources[0] };

  const [used, setUsed] = useState({});
  const [unused, setUnused] = useState({});
  const [duplicated, setDuplicated] = useState({});
  const [themes, setThemes] = useState([]);

  const {
    resourceName,
    language,
    loading,
    error,
    updateResource,
    hasResponseData,
    response: cards,
  } = useResourceState(availableResources, initialState);

  const {
    value: groups,
    loading: loadingLevel4,
    error: errorLevel4,
  } = useAsync(async () => {
    const response = await fetch(`${LOCALHOST_RESOURCE_URL}/${resourceName}-extra-${language}.json`);
    const result = await response.json();

    return result;
  }, [language]);

  useEffect(() => {
    if (!loading && !loadingLevel4 && cards && groups) {
      const result = parseData(cards, groups);
      setThemes(result.themes);
      setUsed(result.used);
      setUnused(result.unused);
      setDuplicated(result.duplicated);
    }
  }, [cards, groups, loading, loadingLevel4]);

  return (
    <Layout>
      <ResourceSelectionBar
        title="Arte Ruim Level 4"
        resourceNames={['arte-ruim']}
        initialValues={initialState}
        updateState={updateResource}
        hasResponseData={hasResponseData && Boolean(groups)}
        loading={loading || loadingLevel4}
        error={error || errorLevel4}
      />

      <Layout.Content className="content">
        <DataLoadingWrapper loading={loading || loadingLevel4} error={error || errorLevel4}>
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
                value={JSON.stringify(duplicated, null, 4)}
              />
            </div>

            <aside className="parser-controls">
              <List
                header={<Title level={2}>Themes</Title>}
                bordered
                dataSource={themes}
                size="small"
                renderItem={(item) => (
                  <List.Item>
                    <Text mark></Text> {item}
                  </List.Item>
                )}
              />
            </aside>
          </div>
        </DataLoadingWrapper>
      </Layout.Content>
    </Layout>
  );
}

export default Level4;
