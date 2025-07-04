import { Input, Layout } from 'antd';
import { ArteRuimLevels } from 'components/ArteRuimLevels';
import { ResponseState } from 'components/Common';
import { SectionTitle } from 'components/Common/SectionTitle';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceSelectionFilters } from 'components/Resource/ResourceSelectionFilters';
import { SearchDuplicates } from 'components/SearchDuplicates';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceState } from 'hooks/useResourceState';
import { useEffect, useState } from 'react';
import type { ArteRuimCard } from 'types';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from 'utils';
import { RESOURCE_NAMES, SEARCH_THRESHOLD } from 'utils/constants';

export function ArteRuimParser() {
  // Set default query params
  useQueryParams({ resourceName: RESOURCE_NAMES.ARTE_RUIM_CARDS, language: 'pt' });

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
        if (text && resourceName) {
          const newId = `${resourceName[0]}-${lastId + index + 1}-${language}`;
          acc[newId] = {
            id: newId,
            text,
            level: 0,
          };
        }
        return acc;
      },
      { ...response },
    );

    setOutput(result);
  };

  return (
    <PageLayout subtitle={resourceName && language ? `Parser (${language})` : ''} title="Arte Ruim">
      <Layout hasSider>
        <PageSider>
          <ResponseState error={error} hasResponseData={hasResponseData} isLoading={isLoading} />
          <ResourceSelectionFilters resourceNames={[RESOURCE_NAMES.ARTE_RUIM_CARDS]} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper error={error} hasResponseData={hasResponseData} isLoading={isLoading}>
            <div className="parser-container">
              <div className="parser-main">
                <SectionTitle>Input New Data</SectionTitle>
                <Input.TextArea cols={15} id="" name="input" onChange={onInputChange} rows={5} />

                <SectionTitle>Output</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id=""
                  name="output"
                  readOnly
                  rows={14}
                  value={JSON.stringify(output, null, 4)}
                />

                <SectionTitle>Duplicates</SectionTitle>
                <Input.TextArea
                  cols={15}
                  id=""
                  name="duplicates"
                  readOnly
                  rows={3}
                  value={JSON.stringify(duplicates)}
                />
              </div>

              <aside className="parser-controls">
                {Boolean(response) && <ArteRuimLevels data={response} />}

                <SectionTitle>
                  Similar Results for Last Entry ({Object.values(searchResults).length})
                </SectionTitle>
                <Input.TextArea
                  cols={10}
                  id=""
                  name="search-results"
                  readOnly
                  rows={5}
                  value={JSON.stringify(searchResults, null, 4)}
                />

                <SearchDuplicates property={property} response={response} />
              </aside>
            </div>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ArteRuimParser;
