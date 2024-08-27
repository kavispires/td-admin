import { Button, Form, Input, Select, Switch } from 'antd';

import { LANGUAGES } from '../../utils/constants';
import { SiderContent } from 'components/Layout';

export type Parameters = {
  prefix: string;
  language: string;
  startingId: number;
  headers: boolean;
  transform: 'capitalize' | 'lowercase' | 'none' | 'uppercase';
};

export const INITIAL_PARAMETERS: Parameters = {
  prefix: '',
  language: 'pt',
  startingId: 1,
  headers: false,
  transform: 'none',
};

type ResourceParametersProps = {
  onUpdateParameters: Function;
};

export function ResourceParameters({ onUpdateParameters }: ResourceParametersProps) {
  const [form] = Form.useForm();

  const onFinish = (v: Parameters) => {
    onUpdateParameters(v);
  };

  return (
    <SiderContent>
      <Form form={form} layout="vertical" onFinish={onFinish} size="small" initialValues={INITIAL_PARAMETERS}>
        <Form.Item label="Prefix" name="prefix" required>
          <Input type="text" placeholder="Prefix" />
        </Form.Item>
        <Form.Item label="Language" name="language">
          <Select style={{ minWidth: '150px' }}>
            {LANGUAGES.map((entry) => (
              <Select.Option key={entry} value={entry}>
                {entry}
              </Select.Option>
            ))}
            <Select.Option key="random" value="dualLanguage">
              Dual Language
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Starting Id" name="startingId">
          <Input type="number" />
        </Form.Item>
        <Form.Item label="First Line Headers?" name="headers">
          <Switch />
        </Form.Item>
        <Form.Item label="Transform text" name="transform">
          <Select style={{ minWidth: '150px' }}>
            <Select.Option key="none" value="none">
              None
            </Select.Option>
            <Select.Option key="capitalize" value="capitalize">
              Capitalize
            </Select.Option>
            <Select.Option key="lowercase" value="lowercase">
              Lowercase
            </Select.Option>
            <Select.Option key="uppercase" value="uppercase">
              Uppercase
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!form.getFieldValue('prefix')}>
            Generate
          </Button>
        </Form.Item>
      </Form>
    </SiderContent>
  );
}
