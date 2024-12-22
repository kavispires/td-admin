import { Button, Form, Select } from 'antd';
import { useState } from 'react';

import { SiderContent } from 'components/Layout';
import { useQueryParams } from '../../hooks/useQueryParams';
import { DUAL_LANGUAGE_RESOURCES, LANGUAGES } from '../../utils/constants';

type ResourceSelectionFiltersProps = {
  resourceNames: string[];
};

export function ResourceSelectionFilters({ resourceNames }: ResourceSelectionFiltersProps) {
  const { queryParams, addParam } = useQueryParams();
  const [form] = Form.useForm();
  const [currentResourceName, setCurrentResourceName] = useState(queryParams.get('resourceName') ?? '');

  const onFinish = (v: any) => {
    const isDualLanguageResource = DUAL_LANGUAGE_RESOURCES.includes(v.resourceName);

    addParam('language', isDualLanguageResource ? null : v.language);
    addParam('resourceName', v.resourceName);
  };

  return (
    <SiderContent>
      <Form
        layout="vertical"
        onFinish={onFinish}
        size="small"
        form={form}
        initialValues={{
          resourceName: queryParams.get('resourceName') ?? '',
          language: queryParams.get('language') ?? '',
        }}
      >
        <Form.Item label="Resource" name="resourceName">
          <Select
            style={{ minWidth: '150px' }}
            value={queryParams.get('resourceName')}
            onChange={(e: string) => setCurrentResourceName(e)}
          >
            {resourceNames.map((resourceName) => (
              <Select.Option key={resourceName} value={resourceName}>
                {resourceName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Language" name="language">
          <Select
            style={{ minWidth: '150px' }}
            disabled={DUAL_LANGUAGE_RESOURCES.includes(currentResourceName)}
          >
            {LANGUAGES.map((entry) => (
              <Select.Option key={entry} value={entry}>
                {entry}
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
    </SiderContent>
  );
}
