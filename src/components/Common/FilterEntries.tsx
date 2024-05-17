import { Form, InputNumber, Segmented, Select, Switch, Tooltip } from 'antd';
import { SegmentedValue } from 'antd/es/segmented';
import { ReactNode } from 'react';

type StrOrNum = string | number;

type FilterSelectProps = {
  label: ReactNode;
  value: string | number;
  onChange: (value: any) => void;
  options: { value: StrOrNum; label: StrOrNum }[] | StrOrNum[];
  placeholder?: string;
};

export function FilterSelect({ label, value, onChange, options, placeholder }: FilterSelectProps) {
  return (
    <Form.Item label={label}>
      <Select style={{ minWidth: '150px' }} onChange={onChange} value={value}>
        {placeholder && (
          <Select.Option value={''} disabled>
            placeholder
          </Select.Option>
        )}
        {options.map((entry) =>
          typeof entry === 'object' ? (
            <Select.Option key={`${label}-${entry.value}`} value={entry.value}>
              {entry.label}
            </Select.Option>
          ) : (
            <Select.Option key={`${label}-${entry}`} value={entry}>
              {entry}
            </Select.Option>
          )
        )}
      </Select>
    </Form.Item>
  );
}

type FilterNumberProps = {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function FilterNumber({ label, value, onChange, min = 0, max = 100, step }: FilterNumberProps) {
  return (
    <Form.Item label={label}>
      <InputNumber
        min={min}
        max={max}
        value={value}
        onChange={(v) => onChange(v ?? max)}
        style={{ minWidth: '150px', width: '100%' }}
        step={step}
      />
    </Form.Item>
  );
}

type FilterSwitchProps = {
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
};

export function FilterSwitch({ label, value, onChange, className }: FilterSwitchProps) {
  return (
    <Form.Item label={label} valuePropName="checked" className={className}>
      <Switch checked={value} onChange={onChange} size="small" />
    </Form.Item>
  );
}

type FilterSegmentsProps = {
  label: ReactNode;
  value?: string;
  onChange: (mode: SegmentedValue) => void;
  options: { value: string; title: string; icon: ReactNode }[];
};

export function FilterSegments({ value, label, onChange, options }: FilterSegmentsProps) {
  return (
    <Form.Item label={label}>
      <Segmented
        block
        value={value}
        onChange={onChange}
        options={options.map((option) => ({
          label: <Tooltip title={option.title}>{option.icon}</Tooltip>,
          value: option.value,
        }))}
      />
    </Form.Item>
  );
}
