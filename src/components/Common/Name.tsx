import { Input, InputProps } from 'antd';
import { LanguageFlag } from './LanguageFlag';

type NameProps = {
  name: DualLanguageValue;
  language: 'en' | 'pt';
} & InputProps;

export function Name({ name, language, ...rest }: NameProps) {
  return (
    <Input
      prefix={<LanguageFlag language={language} width="1em" />}
      placeholder={`Name in ${language.toUpperCase()}`}
      defaultValue={name[language]}
      size="small"
      {...rest}
    />
  );
}
