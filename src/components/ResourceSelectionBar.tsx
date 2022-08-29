import { Button, Divider, Form, PageHeader, Select, Tag } from 'antd';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryParams } from '../hooks/useQueryParams';
import { DUAL_LANGUAGE_RESOURCES, LANGUAGES } from '../utils/constants';
import { Menu } from './Menu';

type TagStateProps = {
  loading: boolean;
  error?:
    | {
        message: string;
      }
    | undefined;
  hasResponseData: boolean;
};
function TagState({ loading, error, hasResponseData }: TagStateProps) {
  if (loading) return <Tag color="blue">Loading...</Tag>;
  if (error) return <Tag color="red">Error</Tag>;
  if (hasResponseData) return <Tag color="green">Loaded</Tag>;
  return <Tag>No Data</Tag>;
}

type ResourceSelectionBarProps = {
  title: ReactElement | string;
  resourceNames: string[];
  updateState: Function;
  initialValues?: PlainObject;
  loading: boolean;
  error?:
    | {
        message: string;
      }
    | undefined;
  hasResponseData: boolean;
  values?: PlainObject;
};

export function ResourceSelectionBar({
  title,
  resourceNames,
  updateState,
  initialValues = {},
  loading,
  error,
  hasResponseData,
  values = {},
}: ResourceSelectionBarProps) {
  const navigate = useNavigate();
  const { updateQueryParams } = useQueryParams();
  const [currentResourceName, setCurrentResourceName] = useState(values.resourceName);

  const onFinish = (v: any) => {
    const isDualLanguageResource = DUAL_LANGUAGE_RESOURCES.includes(v.resourceName);
    const props = {
      ...v,
      language: isDualLanguageResource ? null : v.language,
    };
    updateState({
      ...props,
    });

    if (isDualLanguageResource) {
      delete props.language;
    }
    updateQueryParams({ ...props });
  };

  return (
    <>
      <PageHeader
        title={title}
        tags={<TagState loading={loading} error={error} hasResponseData={hasResponseData} />}
        onBack={() => navigate(-1)}
        extra={<Menu />}
      />
      <Form
        className="resource-selection-bar"
        layout="inline"
        onFinish={onFinish}
        size="small"
        initialValues={{ ...initialValues, ...values }}
      >
        <Form.Item label="Resource" name="resourceName">
          <Select
            style={{ minWidth: '150px' }}
            value={values.resourceName}
            onChange={(e: string) => setCurrentResourceName(e)}
          >
            {resourceNames.map((rn) => (
              <Select.Option key={rn} value={rn}>
                {rn}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Language" name="language">
          <Select
            style={{ minWidth: '50px' }}
            disabled={DUAL_LANGUAGE_RESOURCES.includes(currentResourceName)}
          >
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
      <Divider />
    </>
  );
}
