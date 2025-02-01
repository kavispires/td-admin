import { Radio, type RadioGroupProps } from 'antd';
import type { ItemAttribute } from 'types';
import { CheckCircleFilled } from '@ant-design/icons';
import { PopoverInfo } from 'components/Common/PopoverInfo';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import { truncate } from 'lodash';

const attributeOptions = [
  { label: 'Opposite', value: ATTRIBUTE_VALUE.OPPOSITE },
  { label: 'Unrelated', value: ATTRIBUTE_VALUE.UNRELATED },
  { label: 'Unclear', value: ATTRIBUTE_VALUE.UNCLEAR },
  { label: 'Related', value: ATTRIBUTE_VALUE.RELATED },
  { label: 'Deterministic', value: ATTRIBUTE_VALUE.DETERMINISTIC },
];

const attributeLimitedOptions = [
  { label: 'Opposite', value: ATTRIBUTE_VALUE.OPPOSITE },
  { label: 'Unrelated', value: ATTRIBUTE_VALUE.UNRELATED },
  { label: 'Unclear', value: ATTRIBUTE_VALUE.UNCLEAR },
  { label: 'Related', value: ATTRIBUTE_VALUE.RELATED },
  { label: 'Deterministic', value: ATTRIBUTE_VALUE.DETERMINISTIC, disabled: true },
];

type AttributionValueButtonsProps = {
  attribute: ItemAttribute;
  value?: number;
  onChange: (attributeId: string, value: number) => void;
  onlyButtons?: boolean;
  size?: RadioGroupProps['size'];
};

export function AttributionValueButtons({
  attribute,
  value,
  onChange,
  onlyButtons,
  size,
}: AttributionValueButtonsProps) {
  if (!attribute) return <></>;

  if (onlyButtons) {
    return (
      <Radio.Group
        options={attribute.limited ? attributeLimitedOptions : attributeOptions}
        onChange={({ target: { value: v } }) => onChange(attribute.id, v)}
        value={value}
        optionType="button"
        buttonStyle="solid"
        size={size}
      />
    );
  }

  return (
    <div key={attribute.id} className="attribute-button-container__row">
      <span className="attribute-button-container__label">
        {truncate(attribute.name.en, { length: 12 })} <PopoverInfo title={attribute.description.en} />
      </span>

      <Radio.Group
        options={attribute.limited ? attributeLimitedOptions : attributeOptions}
        onChange={({ target: { value: v } }) => onChange(attribute.id, v)}
        value={value}
        optionType="button"
        buttonStyle="solid"
        size={size}
      />

      <span>
        <CheckCircleFilled style={{ color: value && value > 7 ? 'green' : 'transparent' }} />
      </span>
    </div>
  );
}
