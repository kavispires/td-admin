import { FireFilled, IdcardOutlined } from '@ant-design/icons';
import { Input, type InputProps, Switch, type SwitchProps, Typography } from 'antd';
import type { TextProps } from 'antd/lib/typography/Text';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
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
      defaultValue={value[language]}
      placeholder={`Value in ${language.toUpperCase()}`}
      prefix={<LanguageFlag language={language} width="1em" />}
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

type IdFieldProps = {
  value: string;
  nsfw?: boolean;
} & Omit<InputProps, 'value'>;

export function IdField({ value, nsfw }: IdFieldProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <span>
      <Input
        onClick={() => copyToClipboard(value)}
        placeholder="Id"
        prefix={nsfw ? <FireFilled style={{ color: 'hotPink' }} /> : <IdcardOutlined />}
        readOnly
        size="small"
        value={value}
        variant="borderless"
      />
    </span>
  );
}
