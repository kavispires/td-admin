import { Button, Form, PageHeader, Select, Tag } from 'antd';
import { LANGUAGES } from '../utils/constants';
import { Menu } from './Menu';
import { useQueryParams } from '../hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';

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
  values = {},
}) {
  const navigate = useNavigate();
  const { updateQueryParams } = useQueryParams();

  const onFinish = (values) => {
    updateState({
      ...values,
    });
    updateQueryParams({ ...values });
  };

  return (
    <PageHeader
      title={title}
      tags={<TagState loading={loading} error={error} hasResponseData={hasResponseData} />}
      onBack={() => navigate(-1)}
      extra={<Menu />}
    >
      <Form layout="inline" onFinish={onFinish} size="small" initialValues={{ ...initialValues, ...values }}>
        <Form.Item label="Resource" name="resourceName">
          <Select style={{ minWidth: '150px' }} value={values.resourceName}>
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
