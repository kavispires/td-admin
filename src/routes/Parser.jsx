import { Alert, Divider, Input, Layout, PageHeader, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { useAsync, useTitle } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';
import DataLoading from '../components/DataLoading';
import { checkForDuplicates, findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';

const { Text, Title } = Typography;

function Parser() {
  useTitle('Arte Ruim - Parser');

  const history = useHistory();
  const [output, setOutput] = useState({});
  const [duplicates, setDuplicates] = useState({});
  const [searchResults, setSearchResults] = useState({});

  const resourceName = 'arte-ruim';
  const language = 'pt';
  const property = 'text';

  const {
    value: data,
    loading,
    error,
  } = useAsync(async () => {
    const response = await fetch(`${LOCALHOST_RESOURCE_URL}/${resourceName}-${language}.json`);
    const result = await response.json();
    setOutput(result);
    return result;
  }, []);

  useEffect(() => {
    if (output) {
      setDuplicates(checkForDuplicates(output, property));
    }
  }, [output]);

  const onInputChange = (e) => {
    const { value } = e.target;
    const parsedInput = value.split('\n');

    const dataArray = Object.values(data ?? {});
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
      { ...data }
    );

    setOutput(result);
  };

  const onSearchSimilar = (e) => {
    const { value = '' } = e.target;
    const str = stringRemoveAccents(value.trim().toLowerCase());

    if (str && str.length >= SEARCH_THRESHOLD) {
      setSearchResults(findSimilar(str, data, property));
    } else {
      setSearchResults({});
    }
  };

  const { level0, level1, level2, level3, level4 } = useMemo(
    () =>
      Object.values(output).reduce(
        (acc, entry) => {
          acc[`level${entry.level}`] += 1;
          return acc;
        },
        {
          level0: 0,
          level1: 0,
          level2: 0,
          level3: 0,
          level4: 0,
        }
      ),
    [output]
  );

  return (
    <Layout>
      <PageHeader title="Parser" onBack={() => history.goBack()} />

      {Boolean(data) && (
        <Alert
          type="success"
          message={`Data loaded for ${resourceName}-${language}`}
          className="with-margin"
        />
      )}
      <Divider />

      <Layout.Content className="content">
        <DataLoading loading={loading} error={error}>
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
              <div className="">
                <Title level={2}>Levels</Title>
                <div>Level 0: {level0}</div>
                <div>Level 1: {level1}</div>
                <div>Level 2: {level2}</div>
                <div>Level 3: {level3}</div>
                <div>Level 4: {level4}</div>
              </div>
              <Divider />

              <div className="parser-flex-column">
                <Title level={2}>Search Similar</Title>
                <Input type="text" onChange={onSearchSimilar} placeholder="Type here" />
                <Input.TextArea
                  name="search-results"
                  id=""
                  cols="10"
                  rows="10"
                  readOnly
                  value={JSON.stringify(searchResults, null, 4)}
                />
              </div>
            </aside>
          </div>
        </DataLoading>
      </Layout.Content>
    </Layout>
  );
}

export default Parser;
