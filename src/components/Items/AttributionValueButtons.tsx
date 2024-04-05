import { Radio, Tooltip } from 'antd';
import { ItemAttribute } from 'types';

import { CheckCircleFilled, QuestionCircleOutlined } from '@ant-design/icons';

import { ATTRIBUTE_VALUE } from 'utils/constants';

const attributeOptions = [
  { label: 'Opposite', value: ATTRIBUTE_VALUE.OPPOSITE },
  { label: 'Unrelated', value: ATTRIBUTE_VALUE.UNRELATED },
  { label: 'Irrelevant', value: ATTRIBUTE_VALUE.IRRELEVANT },
  { label: 'Related', value: ATTRIBUTE_VALUE.RELATED },
  { label: 'Deterministic', value: ATTRIBUTE_VALUE.DETERMINISTIC },
];

type AttributionValueButtonsProps = {
  attribute: ItemAttribute;
  value?: number;
  onChange: (attributeId: string, value: number) => void;
};

export function AttributionValueButtons({ attribute, value, onChange }: AttributionValueButtonsProps) {
  if (!attribute) return <></>;

  return (
    <div key={attribute.id} className="attribute-button-container__row">
      <span className="attribute-button-container__label">
        {attribute.name.en}{' '}
        <Tooltip title={attribute.description.en}>
          <QuestionCircleOutlined />
        </Tooltip>
      </span>

      <Radio.Group
        options={attributeOptions}
        onChange={({ target: { value: v } }) => onChange(attribute.id, v)}
        value={value}
        optionType="button"
        buttonStyle="solid"
      />

      <span>
        <CheckCircleFilled style={{ color: value && value > 7 ? 'green' : 'transparent' }} />
      </span>
    </div>
  );
}
