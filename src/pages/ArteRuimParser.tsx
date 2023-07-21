import { Divider, Input, Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTitle } from 'react-use';

import { ArteRuimLevels } from '../components/ArteRuimLevels';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionFilters } from '../components/Resource/ResourceSelectionFilters';
import { SearchDuplicates } from '../components/SearchDuplicates';
import { useResourceState } from '../hooks/useResourceState';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { DEFAULT_LANGUAGE, RESOURCE_NAMES, SEARCH_THRESHOLD } from '../utils/constants';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';

const { Text, Title } = Typography;

export function ArteRuimParser() {
  useTitle('Arte Ruim - Parser');
  const [searchResults, setSearchResults] = useState({});

  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const property = 'text';

  const { resourceName, language, isLoading, error, hasResponseData, response } = useResourceState([
    RESOURCE_NAMES.ARTE_RUIM_CARDS,
  ]);

  useEffect(() => {
    if (response) {
      setDuplicates(checkForDuplicates(response, property));
      setOutput(response);
    }
  }, [response]);

  const onInputChange = (e: any) => {
    const { value } = e.target;
    const parsedInput = value.split('\n');

    const dataArray: any[] = Object.values(response ?? {});
    const lastId = Number(dataArray[dataArray.length - 1].id.split('-')[1]) || 1;

    if (parsedInput.at(-1) && parsedInput.at(-1).length > SEARCH_THRESHOLD) {
      const str = stringRemoveAccents(parsedInput.at(-1).trim().toLowerCase());

      setSearchResults(findSimilar(str, response, property));
    } else {
      setSearchResults({});
    }

    const result = parsedInput.reduce(
      (acc: Record<CardId, ArteRuimCard>, text: string, index: number) => {
        if (text) {
          const newId = `${resourceName![0]}-${lastId + index + 1}-${language}`;
          acc[newId] = {
            id: newId,
            text,
            level: 0,
          };
        }
        return acc;
      },
      { ...response }
    );

    setOutput(result);
  };

  return (
    <Layout>
      <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
      <ResourceSelectionFilters title="Arte Ruim Parser" resourceNames={[RESOURCE_NAMES.ARTE_RUIM_CARDS]} />

      <Layout.Content className="content">
        <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
          <div className="parser-container">
            <div className="parser-main">
              <Title level={2}>Adding Data</Title>
              <Text>Input</Text>
              <Input.TextArea name="input" id="" cols={15} rows={5} onChange={onInputChange} />
              <Text>Output</Text>
              <Input.TextArea
                name="output"
                id=""
                cols={15}
                rows={15}
                readOnly
                value={JSON.stringify(output, null, 4)}
              />
              <Text>Duplicates</Text>

              <Input.TextArea
                name="duplicates"
                id=""
                cols={15}
                rows={3}
                readOnly
                value={JSON.stringify(duplicates)}
              />
            </div>

            <aside className="parser-controls">
              <ArteRuimLevels data={response} />
              <Divider />

              <Typography.Title level={3}>Similar Results for Last Entry</Typography.Title>
              <Input.TextArea
                name="search-results"
                id=""
                cols={10}
                rows={5}
                readOnly
                value={JSON.stringify(searchResults, null, 4)}
              />

              <SearchDuplicates response={response} property={property} />
            </aside>
          </div>
        </DataLoadingWrapper>
      </Layout.Content>
    </Layout>
  );
}
