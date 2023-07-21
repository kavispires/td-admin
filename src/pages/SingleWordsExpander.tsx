import { Input, Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionFilters } from '../components/Resource/ResourceSelectionFilters';
import { SearchDuplicates } from '../components/SearchDuplicates';
import { useResourceState } from '../hooks/useResourceState';
import { findSimilar, stringRemoveAccents } from '../utils';
import { RESOURCE_NAMES, SEARCH_THRESHOLD } from '../utils/constants';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { Header } from 'components/Layout/Header';
import { useQueryParams } from 'hooks/useQueryParams';
import { SectionTitle } from 'components/Common/SectionTitle';

const { Text } = Typography;

export function SingleWordsExpander() {
  // Set default query params
  useQueryParams({ resourceName: RESOURCE_NAMES.SINGLE_WORDS, language: 'pt' });

  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const [reference, setReference] = useState<Record<CardId, TextCard>>({});
  const property = 'text';

  const { language, isLoading, error, hasResponseData, response } = useResourceState([
    RESOURCE_NAMES.SINGLE_WORDS,
  ]);

  useEffect(() => {
    if (response) {
      const cache: BooleanDictionary = {};
      const newDuplicates: StringDictionary = {};
      const selected = Object.values(response as Record<CardId, TextCard>)
        .filter((entry) => {
          const parsedString = stringRemoveAccents(entry.text).toLowerCase();
          if (cache[parsedString]) {
            newDuplicates[entry.id] = entry.text;
            return false;
          }
          cache[parsedString] = true;
          return true;
        })
        .map((e: TextCard, i) => ({
          ...e,
          id: `sw-${i + 1}-${language}`,
        }))
        .reduce((acc: Record<CardId, TextCard>, entry) => {
          acc[entry.id] = entry;
          return acc;
        }, {});

      setReference(selected);

      setDuplicates(newDuplicates);
      setOutput(selected);
    }
  }, [response, language]);

  const onInputChange = (e: any) => {
    const { value } = e.target;
    const parsedInput = value.split('\n');
    const dataArray = Object.values(reference);
    const lastId = Number(dataArray[dataArray.length - 1].id.split('-')[1]) || 1;

    const result = parsedInput.reduce(
      (acc: Record<CardId, TextCard>, text: string, index: number) => {
        // Check if it is duplicate
        const isDuplicate = isExactDuplicate(text, response, property);

        if (text && !isDuplicate) {
          const newId = `sw-${lastId + index + 1}-${language}`;
          acc[newId] = {
            id: newId,
            text: text.toLowerCase(),
          };
        }
        return acc;
      },
      { ...reference }
    );

    setOutput(result);
  };

  return (
    <Layout>
      <Header title="Single Word Expander" subtitle={Boolean(language) ? `${language}` : ''} />

      <Layout hasSider>
        <Layout.Sider className="sider">
          <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <ResourceSelectionFilters resourceNames={[RESOURCE_NAMES.SINGLE_WORDS]} />
        </Layout.Sider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            <div className="parser-container">
              <div className="parser-main">
                <SectionTitle>Input New Data</SectionTitle>

                <Input.TextArea name="input" id="" cols={15} rows={5} onChange={onInputChange} />

                <SectionTitle>Output ({Object.keys(output).length})</SectionTitle>
                <Input.TextArea
                  name="output"
                  id=""
                  cols={15}
                  rows={13}
                  readOnly
                  value={JSON.stringify(output, null, 4)}
                />

                <SectionTitle>Duplicates ({Object.keys(duplicates).length})</SectionTitle>
                <Input.TextArea
                  name="duplicates"
                  id=""
                  cols={15}
                  rows={3}
                  readOnly
                  value={JSON.stringify(duplicates, null, 4)}
                />
              </div>

              <aside className="parser-controls">
                <SectionTitle>Database</SectionTitle>
                <Text>
                  {Object.keys(response).length} entries / {Object.keys(reference).length}
                </Text>
                <SearchDuplicates response={response} property={property} />
              </aside>
            </div>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

const isExactDuplicate = (value: string, response: PlainObject, property: string) => {
  const str = stringRemoveAccents(value.trim().toLowerCase());
  if (str.length > SEARCH_THRESHOLD) {
    const similar = findSimilar(str, response, property);

    return Object.values(similar).some((e) => stringRemoveAccents(e) === str);
  }

  return false;
};
