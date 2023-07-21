import { Input, Layout, List, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useAsync, useTitle } from 'react-use';

import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionFilters } from '../components/Resource/ResourceSelectionFilters';
import { useResourceState } from '../hooks/useResourceState';
import { LOCALHOST_RESOURCE_URL, RESOURCE_NAMES } from '../utils/constants';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';

const { Text, Title } = Typography;

const parseData = (cards: Record<CardId, ArteRuimCard>, groups: Record<string, ArteRuimGroup>) => {
  const themes = Object.values(groups)
    .map((entry) => entry.theme)
    .sort();

  const used: StringDictionary = {};
  const unused: StringDictionary = {};
  const duplicated: StringDictionary = {};
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

export function ArteRuimGroups() {
  useTitle('Arte Ruim - Groups');

  const [used, setUsed] = useState({});
  const [unused, setUnused] = useState({});
  const [duplicated, setDuplicated] = useState({});
  const [themes, setThemes] = useState<string[]>([]);

  const {
    language,
    isLoading,
    error,
    hasResponseData,
    response: cards,
  } = useResourceState([RESOURCE_NAMES.ARTE_RUIM_CARDS]);

  const {
    value: groups,
    loading: loadingLevel4,
    error: errorLevel4,
  } = useAsync(async () => {
    const response = await fetch(
      `${LOCALHOST_RESOURCE_URL}/${RESOURCE_NAMES.ARTE_RUIM_GROUPS}-${language}.json`
    );
    const result = await response.json();

    return result;
  }, [language]);

  useEffect(() => {
    if (!isLoading && !loadingLevel4 && cards && groups) {
      const result = parseData(cards, groups);
      setThemes(result.themes);
      setUsed(result.used);
      setUnused(result.unused);
      setDuplicated(result.duplicated);
    }
  }, [cards, groups, isLoading, loadingLevel4]);

  return (
    <Layout>
      <ResourceResponseState
        hasResponseData={hasResponseData && Boolean(groups)}
        isLoading={isLoading || loadingLevel4}
        error={error || errorLevel4}
      />
      <ResourceSelectionFilters title="Arte Ruim Level 4" resourceNames={['arte-ruim']} />

      <Layout.Content className="content">
        <DataLoadingWrapper
          isLoading={isLoading || loadingLevel4}
          error={error || errorLevel4}
          hasResponseData={hasResponseData && Boolean(groups)}
        >
          <div className="parser-container">
            <div className="parser-main">
              <Title level={2}>Used in Groups ({Object.keys(used).length})</Title>
              <Input.TextArea
                name="output"
                id=""
                cols={15}
                rows={10}
                readOnly
                value={JSON.stringify(used, null, 4)}
              />
              <Title level={2}>Unused in Groups ({Object.keys(unused).length})</Title>
              <Input.TextArea
                name="output"
                id=""
                cols={15}
                rows={10}
                readOnly
                value={JSON.stringify(unused, null, 4)}
              />
              <Title level={2}>In More than One Group ({Object.keys(duplicated).length})</Title>
              <Input.TextArea
                name="duplicates"
                id=""
                cols={15}
                rows={5}
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
