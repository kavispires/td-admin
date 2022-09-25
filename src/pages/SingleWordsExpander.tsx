import { Divider, Input, Layout, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTitle } from 'react-use';

import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionBar } from '../components/ResourceSelectionBar';
import { SearchDuplicates } from '../components/SearchDuplicates';
import { useResourceState } from '../hooks/useResourceState';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { DEFAULT_LANGUAGE, RESOURCE_NAMES, SEARCH_THRESHOLD } from '../utils/constants';

const { Text, Title } = Typography;

export function SingleWordsExpander() {
  useTitle('Single Words - Expander');

  const initialState = { language: DEFAULT_LANGUAGE, resourceName: RESOURCE_NAMES.SINGLE_WORDS };

  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const [reference, setReference] = useState<Record<CardId, TextCard>>({});
  const property = 'text';

  const { language, loading, error, updateResource, hasResponseData, response } = useResourceState(
    [RESOURCE_NAMES.SINGLE_WORDS],
    initialState
  );
  const cache: BooleanDictionary = {};

  useEffect(() => {
    if (response) {
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
      <ResourceSelectionBar
        title="Single Word Expander"
        resourceNames={[RESOURCE_NAMES.SINGLE_WORDS]}
        initialValues={initialState}
        updateState={updateResource}
        hasResponseData={hasResponseData}
        loading={loading}
        error={error}
      />

      <Layout.Content className="content">
        <DataLoadingWrapper loading={loading} error={error} hasResponseData={hasResponseData}>
          <div className="parser-container">
            <div className="parser-main">
              <Title level={2}>Adding Data</Title>
              <Text>
                Database: {Object.keys(response).length} entries / {Object.keys(reference).length}
              </Text>
              <Text>Input</Text>
              <Input.TextArea name="input" id="" cols={15} rows={5} onChange={onInputChange} />
              <Text>Output ({Object.keys(output).length})</Text>
              <Input.TextArea
                name="output"
                id=""
                cols={15}
                rows={15}
                readOnly
                value={JSON.stringify(output, null, 4)}
              />
              <Text>Duplicates ({Object.keys(duplicates).length})</Text>

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
              <Divider />

              <SearchDuplicates response={response} property={property} />
            </aside>
          </div>
        </DataLoadingWrapper>
      </Layout.Content>
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
