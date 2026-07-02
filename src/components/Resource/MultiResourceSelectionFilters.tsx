import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { LanguageToggle } from '@components/Common/LanguageToggle';
import { SiderContent } from '@components/Layout';
import { useQueryParams } from '@hooks/useQueryParams';
import { DUAL_LANGUAGE_RESOURCES } from '@utils/resources-list';
import { Badge, Button, Divider, Form, Select, Space, Tag, Typography } from 'antd';
import { useState } from 'react';

type MultiResourceSelectionFiltersProps = {
  /**
   * Available resource names
   */
  resourceNames: string[];
  /**
   * Maximum number of resources that can be selected
   */
  maxResources?: number;
};

type FormValues = {
  resourceName: string;
  language: string;
};

/**
 * Multi-resource selection component for Resource Converter
 * Allows selecting up to 3 resources to load and merge
 */
export function MultiResourceSelectionFilters({
  resourceNames,
  maxResources = 3,
}: MultiResourceSelectionFiltersProps) {
  const { queryParams, addParam, addParams } = useQueryParams();
  const [form] = Form.useForm<FormValues>();

  // Parse selected resources from query params (comma-separated)
  const selectedResourcesParam = queryParams.get('resources') ?? '';
  const [selectedResources, setSelectedResources] = useState<string[]>(
    selectedResourcesParam ? selectedResourcesParam.split(',').filter(Boolean) : [],
  );

  const currentLanguage = queryParams.get('language') ?? 'pt';
  const dualLanguageResources = DUAL_LANGUAGE_RESOURCES as readonly string[];

  // Check if any selected resource requires language selection
  const requiresLanguage = selectedResources.some((r) => !dualLanguageResources.includes(r));

  const handleAddResource = (v: FormValues) => {
    if (!v.resourceName || selectedResources.includes(v.resourceName)) {
      return;
    }

    if (selectedResources.length >= maxResources) {
      alert(`You can only select up to ${maxResources} resources`);
      return;
    }

    const newSelected = [...selectedResources, v.resourceName];
    setSelectedResources(newSelected);

    // Update query params
    addParams({
      resources: newSelected.join(','),
      language: v.language || currentLanguage,
    });

    // Reset form
    form.resetFields(['resourceName']);
  };

  const handleRemoveResource = (resourceName: string) => {
    const newSelected = selectedResources.filter((r) => r !== resourceName);
    setSelectedResources(newSelected);

    // Update query params
    addParam('resources', newSelected.join(','));
  };

  const handleClearAll = () => {
    setSelectedResources([]);
    addParam('resources', '');
  };

  const handleLanguageChange = (language: string | number) => {
    addParam('language', String(language));
  };

  return (
    <SiderContent>
      <Typography.Title level={5}>
        Selected Resources
        {selectedResources.length > 0 && (
          <Badge
            count={selectedResources.length}
            style={{ marginLeft: 8 }}
          />
        )}
      </Typography.Title>

      {selectedResources.length > 0 ? (
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: 12 }}
        >
          {selectedResources.map((resource) => (
            <Tag
              closable
              color="blue"
              key={resource}
              onClose={() => handleRemoveResource(resource)}
              style={{ width: '100%', marginRight: 0 }}
            >
              {resource}
            </Tag>
          ))}
          <Button
            block
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleClearAll}
            size="small"
            type="text"
          >
            Clear All
          </Button>
        </Space>
      ) : (
        <Typography.Text
          style={{ display: 'block', marginBottom: 12 }}
          type="secondary"
        >
          No resources selected
        </Typography.Text>
      )}

      <Divider style={{ margin: '12px 0' }} />

      <Typography.Title level={5}>Add Resource</Typography.Title>

      <Form
        form={form}
        initialValues={{
          resourceName: '',
          language: currentLanguage,
        }}
        layout="vertical"
        onFinish={handleAddResource}
        size="small"
      >
        <Form.Item
          label="Resource"
          name="resourceName"
        >
          <Select
            options={resourceNames
              .filter((r) => !selectedResources.includes(r))
              .map((resourceName) => ({ value: resourceName, label: resourceName }))}
            placeholder="Select a resource"
            showSearch
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Language"
          name="language"
        >
          <LanguageToggle
            disabled={!requiresLanguage}
            onChange={handleLanguageChange}
            value={currentLanguage}
          />
        </Form.Item>

        <Form.Item>
          <Button
            block
            disabled={selectedResources.length >= maxResources}
            htmlType="submit"
            icon={<PlusOutlined />}
            type="primary"
          >
            Add Resource
          </Button>
        </Form.Item>
      </Form>

      {selectedResources.length >= maxResources && (
        <Typography.Text
          style={{ fontSize: 12 }}
          type="warning"
        >
          Maximum {maxResources} resources reached
        </Typography.Text>
      )}
    </SiderContent>
  );
}
