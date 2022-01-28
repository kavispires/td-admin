import { Divider, Input, Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTitle } from 'react-use';
import { DataLoadingWrapper } from '../../components/DataLoadingWrapper';
import { checkForDuplicates } from '../../utils';
import { ResourceSelectionBar } from '../../components/ResourceSelectionBar';
import { useResourceState } from '../../hooks/useResourceState';
import { ArteRuimLevels } from '../../components/ArteRuimLevels';
import { SearchDuplicates } from '../../components/SearchDuplicates';

const { Text, Title } = Typography;

function Parser() {
  useTitle('Arte Ruim - Parser');

  const availableResources = ['arte-ruim'];
  const initialState = { language: 'pt', resourceName: availableResources[0] };

  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const property = 'text';

  const { resourceName, language, loading, error, updateResource, hasResponseData, response } =
    useResourceState(availableResources, initialState);

  useEffect(() => {
    if (response) {
      setDuplicates(checkForDuplicates(response, property));
      setOutput(response);
    }
  }, [response]);

  const onInputChange = (e) => {
    const { value } = e.target;
    const parsedInput = value.split('\n');

    const dataArray = Object.values(response ?? {});
    const lastId = Number(dataArray[dataArray.length - 1].id.split('-')[1]) || 1;

    const result = parsedInput.reduce(
      (acc, text, index) => {
        if (text) {
          const newId = `${resourceName[0]}-${lastId + index + 1}-${language}`;
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
      <ResourceSelectionBar
        title="Arte Ruim Parser"
        resourceNames={['arte-ruim']}
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
              <Text>Input</Text>
              <Input.TextArea name="input" id="" cols="15" rows="5" onChange={onInputChange} />
              <Text>Output</Text>
              <Input.TextArea
                name="output"
                id=""
                cols="15"
                rows="15"
                readOnly
                value={JSON.stringify(output, null, 4)}
              />
              <Text>Duplicates</Text>

              <Input.TextArea
                name="duplicates"
                id=""
                cols="15"
                rows="3"
                readOnly
                value={JSON.stringify(duplicates)}
              />
            </div>

            <aside className="parser-controls">
              <ArteRuimLevels data={response} />
              <Divider />

              <SearchDuplicates response={response} property={property} />
            </aside>
          </div>
        </DataLoadingWrapper>
      </Layout.Content>
    </Layout>
  );
}

export default Parser;
