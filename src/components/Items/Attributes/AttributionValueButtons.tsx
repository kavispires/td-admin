import { CheckCircleFilled } from '@ant-design/icons';
import { Radio, type RadioGroupProps } from 'antd';
import { PopoverInfo } from 'components/Common/PopoverInfo';
import { truncate } from 'lodash';
import type { ItemAttribute } from 'types';
import { ATTRIBUTE_VALUE } from 'utils/constants';

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
  if (!attribute) return null;

  if (onlyButtons) {
    return (
      <Radio.Group
        buttonStyle="solid"
        onChange={({ target: { value: v } }) => onChange(attribute.id, v)}
        options={attribute.limited ? attributeLimitedOptions : attributeOptions}
        optionType="button"
        size={size}
        value={value}
      />
    );
  }

  return (
    <div className="attribute-button-container__row" key={attribute.id}>
      <span className="attribute-button-container__label">
        {truncate(attribute.name.en, { length: 12 })} <PopoverInfo title={attribute.description.en} />
      </span>

      <Radio.Group
        buttonStyle="solid"
        onChange={({ target: { value: v } }) => onChange(attribute.id, v)}
        options={attribute.limited ? attributeLimitedOptions : attributeOptions}
        optionType="button"
        size={size}
        value={value}
      />

      <span>
        <CheckCircleFilled style={{ color: value && value > 7 ? 'green' : 'transparent' }} />
      </span>
    </div>
  );
}
