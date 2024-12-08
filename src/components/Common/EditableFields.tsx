import { Input, InputProps } from 'antd';
import { LanguageFlag } from './LanguageFlag';

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
