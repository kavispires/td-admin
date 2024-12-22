import { FireFilled } from '@ant-design/icons';
import { Input, type InputProps, Switch, type SwitchProps, Typography } from 'antd';
import type { TextProps } from 'antd/lib/typography/Text';
import { LanguageFlag } from './LanguageFlag';

export function Label({ strong, ...props }: TextProps) {
  return <Typography.Text strong={strong ?? true} {...props} />;
}

type DualLanguageTextFieldProps = {
  value: DualLanguageValue;
  language: 'en' | 'pt';
} & Omit<InputProps, 'name' | 'value'>;

export function DualLanguageTextField({ value, language, ...rest }: DualLanguageTextFieldProps) {
  return (
    <Input
      prefix={<LanguageFlag language={language} width="1em" />}
      placeholder={`Value in ${language.toUpperCase()}`}
      defaultValue={value[language]}
      size="small"
      {...rest}
    />
  );
}

type NSFWFieldProps = {
  value?: boolean;
} & Omit<SwitchProps, 'checked' | 'checkedChildren'>;

export function NSFWField({ value, ...props }: NSFWFieldProps) {
  return <Switch checked={value} checkedChildren={<FireFilled style={{ color: 'hotpink' }} />} {...props} />;
}