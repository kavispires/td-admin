import { Button, Form, Input, Select, Switch } from 'antd';
import { SiderContent } from 'components/Layout';
import { LANGUAGES } from '../../utils/constants';

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
  onUpdateParameters: (params: Parameters) => void;
};

export function ResourceParameters({ onUpdateParameters }: ResourceParametersProps) {
  const [form] = Form.useForm();

  const onFinish = (v: Parameters) => {
    onUpdateParameters(v);
  };

  const prefix = Form.useWatch(['prefix'], form);

  return (
    <SiderContent>
      <Form form={form} initialValues={INITIAL_PARAMETERS} layout="vertical" onFinish={onFinish} size="small">
        <Form.Item label="Prefix" name="prefix" required>
          <Input placeholder="Prefix" type="text" />
        </Form.Item>
        <Form.Item label="Language" name="language">
          <Select
            options={[
              ...LANGUAGES.map((entry) => ({ value: entry, label: entry })),
              { value: 'dualLanguage', label: 'Dual Language' },
            ]}
            style={{ minWidth: '150px' }}
          />
        </Form.Item>
        <Form.Item label="Starting Id" name="startingId">
          <Input type="number" />
        </Form.Item>
        <Form.Item label="First Line Headers?" name="headers">
          <Switch />
        </Form.Item>
        <Form.Item label="Transform text" name="transform">
          <Select
            options={[
              { value: 'none', label: 'None' },
              { value: 'capitalize', label: 'Capitalize' },
              { value: 'lowercase', label: 'Lowercase' },
              { value: 'uppercase', label: 'Uppercase' },
            ]}
            style={{ minWidth: '150px' }}
          />
        </Form.Item>
        <Form.Item>
          <Button disabled={!prefix?.trim()} htmlType="submit" type="primary">
            Generate
          </Button>
        </Form.Item>
      </Form>
    </SiderContent>
  );
}
