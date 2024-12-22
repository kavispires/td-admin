import { Input, Layout } from 'antd';
import { ArteRuimLevels } from 'components/ArteRuimLevels';
import { SectionTitle } from 'components/Common/SectionTitle';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResponseState } from 'components/Common';
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
      { ...response },
    );

    setOutput(result);
  };

  return (
    <PageLayout title="Arte Ruim" subtitle={Boolean(resourceName && language) ? `Parser (${language})` : ''}>
      <Layout hasSider>
        <PageSider>
          <ResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <ResourceSelectionFilters resourceNames={[RESOURCE_NAMES.ARTE_RUIM_CARDS]} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            <div className="parser-container">
              <div className="parser-main">
                <SectionTitle>Input New Data</SectionTitle>
                <Input.TextArea name="input" id="" cols={15} rows={5} onChange={onInputChange} />

                <SectionTitle>Output</SectionTitle>
                <Input.TextArea
                  name="output"
                  id=""
                  cols={15}
                  rows={14}
                  readOnly
                  value={JSON.stringify(output, null, 4)}
                />

                <SectionTitle>Duplicates</SectionTitle>
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
                {Boolean(response) && <ArteRuimLevels data={response} />}

                <SectionTitle>
                  Similar Results for Last Entry ({Object.values(searchResults).length})
                </SectionTitle>
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
    </PageLayout>
  );
}

export default ArteRuimParser;
