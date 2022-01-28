import { Input, Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTitle } from 'react-use';
import { DataLoadingWrapper } from '../components/DataLoadingWrapper';
import { ResourceSelectionBar } from '../components/ResourceSelectionBar';
import { useResourceState } from '../hooks/useResourceState';
import { RESOURCE_NAMES } from '../utils/constants';
import { SearchDuplicates } from '../components/SearchDuplicates';

const { Text, Title } = Typography;

function Resource() {
  useTitle('Resource');

  const initialState = {
    language: 'pt',
    resourceName: RESOURCE_NAMES[Math.floor(Math.random() * RESOURCE_NAMES.length)],
  };

  const [output, setOutput] = useState({});
  const property = 'text';

  const { resourceName, language, loading, error, updateResource, hasResponseData, response } =
    useResourceState(RESOURCE_NAMES, initialState);

  useEffect(() => {
    if (response) {
      setOutput(response);
    }
  }, [response]);

  return (
    <Layout>
      <ResourceSelectionBar
        title={`Data for ${resourceName}-${language}`}
        resourceNames={RESOURCE_NAMES}
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
              <Title level={2}>Data</Title>
              <Text>Output</Text>
              <Input.TextArea
                name="output"
                id=""
                cols="15"
                rows="15"
                readOnly
                value={JSON.stringify(output, null, 4)}
              />
            </div>

            <aside className="parser-controls">
              <SearchDuplicates response={response} property={property} />
            </aside>
          </div>
        </DataLoadingWrapper>
      </Layout.Content>
    </Layout>
  );
}

export default Resource;
