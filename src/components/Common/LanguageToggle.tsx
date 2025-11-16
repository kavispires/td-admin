import { Form, Segmented, type SegmentedProps, Tooltip } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { useEffect } from 'react';
import { LanguageFlag } from './LanguageFlag';

type LanguageToggleProps = {
  withQueryParams?: boolean;
  withLabel?: boolean;
} & Omit<SegmentedProps, 'options'>;

export function LanguageToggle({ withQueryParams, withLabel, ...props }: LanguageToggleProps) {
  const { queryParams, addParam } = useQueryParams();

  const activeValue = withQueryParams ? (queryParams.get('language') ?? '') : (props.value ?? '');

  /**
   * Handles language change from Segmented component.
   * Accepts string or number, but only processes string values.
   */
  const onChangeLanguage = (value: string | number) => {
    const newLanguage = value as string;
    if (withQueryParams) {
      addParam('language', newLanguage as Language);
    }
  };

  useEffect(() => {
    if (withQueryParams && activeValue) {
      addParam('language', activeValue);
    }
  }, [withQueryParams, activeValue, addParam]);

  const ptLabel = (
    <Tooltip arrow title="PT" trigger="hover">
      <LanguageFlag language="pt" />
    </Tooltip>
  );
  const enLabel = (
    <Tooltip arrow title="EN" trigger="hover">
      <LanguageFlag language="en" />
    </Tooltip>
  );
  const segment = (
    <Segmented
      onChange={withQueryParams ? onChangeLanguage : props.onChange}
      options={[
        { value: 'en', label: enLabel },
        { value: 'pt', label: ptLabel },
      ]}
      shape="round"
      value={props.value ?? activeValue}
      {...props}
    />
  );

  if (withLabel) {
    return (
      <Form.Item label="Language" name="language">
        {segment}
      </Form.Item>
    );
  }

  return segment;
}
