import { Button, Form, PageHeader, Select, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { LANGUAGES } from '../utils/constants';
import { Menu } from './Menu';

function TagState({ loading, error, hasResponseData }) {
  if (loading) return <Tag color="blue">Loading...</Tag>;
  if (error) return <Tag color="red">Error</Tag>;
  if (hasResponseData) return <Tag color="green">Loaded</Tag>;
  return <Tag>No Data</Tag>;
}

export function ResourceSelectionBar({
  title,
  resourceNames,
  updateState,
  initialValues = {},
  loading,
  error,
  hasResponseData,
}) {
  const history = useHistory();

  const onFinish = ({ resourceName, language }) => {
    updateState({
      language,
      resourceName,
    });
  };

  return (
    <PageHeader
      title={title}
      tags={<TagState loading={loading} error={error} hasResponseData={hasResponseData} />}
      onBack={() => history.goBack()}
      extra={<Menu />}
    >
      <Form layout="inline" onFinish={onFinish} size="small" initialValues={initialValues}>
        <Form.Item label="Resource" name="resourceName">
          <Select style={{ minWidth: '150px' }}>
            {resourceNames.map((rn) => (
              <Select.Option key={rn} value={rn}>
                {rn}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Language" name="language">
          <Select style={{ minWidth: '50px' }}>
            {LANGUAGES.map((lng) => (
              <Select.Option key={lng} value={lng}>
                {lng}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Load
          </Button>
        </Form.Item>
      </Form>
    </PageHeader>
  );
}
