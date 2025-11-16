import { Button, Form, Select } from 'antd';
import { LanguageToggle } from 'components/Common/LanguageToggle';
import { SiderContent } from 'components/Layout';
import { useState } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import { DUAL_LANGUAGE_RESOURCES } from '../../utils/constants';

type ResourceSelectionFiltersProps = {
  resourceNames: string[];
};

type FormValues = {
  resourceName: string;
  language: string;
};

export function ResourceSelectionFilters({ resourceNames }: ResourceSelectionFiltersProps) {
  const { queryParams, addParam } = useQueryParams();
  const [form] = Form.useForm<FormValues>();
  const [currentResourceName, setCurrentResourceName] = useState(queryParams.get('resourceName') ?? '');

  const onFinish = (v: FormValues) => {
    const isDualLanguageResource = DUAL_LANGUAGE_RESOURCES.includes(v.resourceName);

    addParam('language', isDualLanguageResource ? null : v.language);
    addParam('resourceName', v.resourceName);
  };

  return (
    <SiderContent>
      <Form
        form={form}
        initialValues={{
          resourceName: queryParams.get('resourceName') ?? '',
          language: queryParams.get('language') ?? '',
        }}
        layout="vertical"
        onFinish={onFinish}
        size="small"
      >
        <Form.Item label="Resource" name="resourceName">
          <Select
            onChange={(e: string) => setCurrentResourceName(e)}
            style={{ minWidth: '150px' }}
            value={queryParams.get('resourceName')}
          >
            {resourceNames.map((resourceName) => (
              <Select.Option key={resourceName} value={resourceName}>
                {resourceName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Language" name="language">
          <LanguageToggle disabled={DUAL_LANGUAGE_RESOURCES.includes(currentResourceName)} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Load
          </Button>
        </Form.Item>
      </Form>
    </SiderContent>
  );
}
