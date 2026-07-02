import { ResponseState } from '@components/Common';
import { SectionTitle } from '@components/Common/SectionTitle';
import { DataLoadingWrapper } from '@components/DataLoadingWrapper';
import { PageLayout } from '@components/Layout';
import { PageSider } from '@components/Layout/PageSider';
import { ResourceSelectionFilters } from '@components/Resource/ResourceSelectionFilters';
import { useBaseUrl } from '@hooks/useBaseUrl';
import { useQueryParams } from '@hooks/useQueryParams';
import { useResourceState } from '@hooks/useResourceState';
import { useQuery } from '@tanstack/react-query';
import type { ArteRuimCardData, ArteRuimGroupData } from '@types';
import { RESOURCES_NAMES } from '@utils/resources-list';
import { Input, Layout, List, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

const parseData = (cards: Record<CardId, ArteRuimCardData>, groups: Record<string, ArteRuimGroupData>) => {
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

function ArteRuimGroups() {
  // Set default query params
  useQueryParams({ resourceName: RESOURCES_NAMES.ARTE_RUIM_CARDS, language: 'pt' });
  const { getUrl } = useBaseUrl('resources');

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
  } = useResourceState([RESOURCES_NAMES.ARTE_RUIM_CARDS]);

  const {
    data: groups,
    isLoading: loadingLevel4,
    error: errorLevel4,
  } = useQuery<any, ResponseError>({
    queryKey: [RESOURCES_NAMES.ARTE_RUIM_GROUPS, language],
    queryFn: async () => {
      const response = await fetch(getUrl(`${RESOURCES_NAMES.ARTE_RUIM_GROUPS}-${language}.json`));
      const result = await response.json();

      return result;
    },
    enabled: Boolean(language),
  });

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
    <PageLayout
      subtitle={language ? `${language}` : ''}
      title="Arte Ruim Groups"
    >
      <Layout hasSider>
        <PageSider>
          <ResponseState
            error={error || errorLevel4}
            hasResponseData={hasResponseData && Boolean(groups)}
            isLoading={isLoading || loadingLevel4}
          />
          <ResourceSelectionFilters resourceNames={[RESOURCES_NAMES.ARTE_RUIM_CARDS]} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={error || errorLevel4}
            hasResponseData={hasResponseData && Boolean(groups)}
            isLoading={isLoading || loadingLevel4}
          >
            <div className="parser-container">
              <div className="parser-main">
                <SectionTitle>Used in Groups ({Object.keys(used).length})</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id="used-groups"
                  name="output"
                  readOnly
                  rows={10}
                  value={JSON.stringify(used, null, 4)}
                />
                <SectionTitle>Unused in Groups ({Object.keys(unused).length})</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id="unused-groups"
                  name="output"
                  readOnly
                  rows={10}
                  value={JSON.stringify(unused, null, 4)}
                />
                <SectionTitle>In More than One Group ({Object.keys(duplicated).length})</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id="duplicated-groups"
                  name="duplicates"
                  readOnly
                  rows={5}
                  value={JSON.stringify(duplicated, null, 4)}
                />
              </div>

              <aside className="parser-controls">
                <List
                  bordered
                  className="theme-list"
                  dataSource={themes}
                  header={<SectionTitle>Themes</SectionTitle>}
                  renderItem={(item) => (
                    <List.Item>
                      <Text mark></Text> {item}
                    </List.Item>
                  )}
                  size="small"
                />
              </aside>
            </div>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ArteRuimGroups;
