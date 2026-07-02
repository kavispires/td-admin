import { ResponseState } from '@components/Common';
import { SectionTitle } from '@components/Common/SectionTitle';
import { DataLoadingWrapper } from '@components/DataLoadingWrapper';
import { PageLayout } from '@components/Layout';
import { PageSider } from '@components/Layout/PageSider';
import { ResourceSelectionFilters } from '@components/Resource/ResourceSelectionFilters';
import { SearchDuplicates } from '@components/SearchDuplicates';
import { useQueryParams } from '@hooks/useQueryParams';
import { useResourceState } from '@hooks/useResourceState';
import type { TextCardData } from '@types';
import { SEARCH_THRESHOLD } from '@utils/constants';
import { RESOURCES_NAMES } from '@utils/resources-list';
import { findSimilar, stringRemoveAccents } from '@utils/string';
import { Input, Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

function SingleWordsExpander() {
  // Set default query params
  useQueryParams({ resourceName: RESOURCES_NAMES.SINGLE_WORDS, language: 'pt' });

  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const [reference, setReference] = useState<Record<CardId, TextCardData>>({});
  const property = 'text';

  const { language, isLoading, error, hasResponseData, response } = useResourceState([
    RESOURCES_NAMES.SINGLE_WORDS,
  ]);

  useEffect(() => {
    if (response) {
      const cache: BooleanDictionary = {};
      const newDuplicates: StringDictionary = {};
      const selected = Object.values(response as Record<CardId, TextCardData>)
        .filter((entry) => {
          const parsedString = stringRemoveAccents(entry.text).toLowerCase();
          if (cache[parsedString]) {
            newDuplicates[entry.id] = entry.text;
            return false;
          }
          cache[parsedString] = true;
          return true;
        })
        .map((e: TextCardData, i) => ({
          ...e,
          id: `sw-${i + 1}-${language}`,
        }))
        .reduce((acc: Record<CardId, TextCardData>, entry) => {
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
      (acc: Record<CardId, TextCardData>, text: string, index: number) => {
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
      { ...reference },
    );

    setOutput(result);
  };

  return (
    <PageLayout
      subtitle={language ? `${language}` : ''}
      title="Single Word Expander"
    >
      <Layout hasSider>
        <PageSider>
          <ResponseState
            error={error}
            hasResponseData={hasResponseData}
            isLoading={isLoading}
          />
          <ResourceSelectionFilters resourceNames={[RESOURCES_NAMES.SINGLE_WORDS]} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={error}
            hasResponseData={hasResponseData}
            isLoading={isLoading}
          >
            <div className="parser-container">
              <div className="parser-main">
                <SectionTitle>Input New Data</SectionTitle>

                <Input.TextArea
                  cols={15}
                  id=""
                  name="input"
                  onChange={onInputChange}
                  rows={5}
                />

                <SectionTitle>Output ({Object.keys(output).length})</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id=""
                  name="output"
                  readOnly
                  rows={13}
                  value={JSON.stringify(output, null, 4)}
                />

                <SectionTitle>Duplicates ({Object.keys(duplicates).length})</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id=""
                  name="duplicates"
                  readOnly
                  rows={3}
                  value={JSON.stringify(duplicates, null, 4)}
                />
              </div>

              <aside className="parser-controls">
                <SectionTitle>Database</SectionTitle>
                <Text>
                  {Object.keys(response ?? {}).length} entries / {Object.keys(reference ?? {}).length}
                </Text>
                <SearchDuplicates
                  property={property}
                  response={response}
                />
              </aside>
            </div>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default SingleWordsExpander;

const isExactDuplicate = (value: string, response: PlainObject, property: string) => {
  const str = stringRemoveAccents(value.trim().toLowerCase());
  if (str.length > SEARCH_THRESHOLD) {
    const similar = findSimilar(str, response, property);

    return Object.values(similar).some((e) => stringRemoveAccents(e) === str);
  }

  return false;
};
