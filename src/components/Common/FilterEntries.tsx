import { Checkbox, Form, InputNumber, Segmented, Select, Switch, Tooltip } from 'antd';
import type { SegmentedValue } from 'antd/es/segmented';
import type { ReactNode } from 'react';

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
      <Select onChange={onChange} style={{ minWidth: '150px' }} value={value}>
        {placeholder && (
          <Select.Option disabled value={''}>
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
          ),
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
        max={max}
        min={min}
        onChange={(v) => onChange(v ?? max)}
        step={step}
        style={{ minWidth: '150px', width: '100%' }}
        value={value}
      />
    </Form.Item>
  );
}

type FilterSwitchProps = {
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export function FilterSwitch({ label, value, onChange, className, disabled }: FilterSwitchProps) {
  return (
    <Form.Item className={className} label={label} valuePropName="checked">
      <Switch checked={value} disabled={disabled} onChange={onChange} size="small" />
    </Form.Item>
  );
}

export function FilterCheckBox({ label, value, onChange, disabled, className }: FilterSwitchProps) {
  return (
    <Form.Item className={className} label={label} valuePropName="checked">
      <Checkbox checked={value} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
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
    <Form.Item label={label} layout={options.length > 2 ? 'vertical' : 'horizontal'}>
      <Segmented
        block
        onChange={onChange}
        options={options.map((option) => ({
          label: (
            <Tooltip arrow title={option.title} trigger="hover">
              {option.icon}
            </Tooltip>
          ),
          value: option.value,
        }))}
        value={value}
      />
    </Form.Item>
  );
}
