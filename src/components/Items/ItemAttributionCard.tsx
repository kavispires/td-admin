import { Affix, Card, Divider, Flex, Input, Radio, Space, Tooltip, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { ItemAttributes } from 'types';

import { CheckCircleFilled, IdcardOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { ItemAttributeStats } from './ItemAttributeStats';
import { ATTRIBUTE_VALUE } from 'utils/constants';

export function ItemAttributionCard() {
  const { activeItem, attributesList, itemAttributeValues, onAttributeChange } =
    useItemsAttributeValuesContext();

  if (!activeItem)
    return (
      <Card>
        <Typography.Text type="secondary">No item selected. Press Random Item!</Typography.Text>
      </Card>
    );

  return (
    <Card>
      <div className="item-attribution-card">
        <Affix offsetTop={120}>
          <Flex vertical gap={6} key={activeItem.id}>
            <Item
              id={activeItem.id}
              width={150}
              title={`${activeItem.name.en} | ${activeItem.name.pt}`}
              // className="sticky-top"
            />
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Id"
              variant="borderless"
              size="small"
              value={activeItem.id}
              readOnly
            />

            <Input
              prefix={<LanguageFlag language="en" width="1em" />}
              placeholder="Name in EN"
              variant="borderless"
              size="small"
              value={activeItem.name.en}
              readOnly
            />

            <Input
              prefix={<LanguageFlag language="pt" width="1em" />}
              placeholder="Name in PT"
              variant="borderless"
              size="small"
              value={activeItem.name.pt}
              readOnly
            />
            <Divider />
            <ItemAttributeStats attributesList={attributesList} itemAttributeValues={itemAttributeValues} />
          </Flex>
        </Affix>

        <Space size="small" direction="vertical" className="my-4 attribute-button-container" wrap>
          {attributesList.map((attribute) => (
            <AttributionValueButtons
              key={attribute.id}
              attribute={attribute}
              value={itemAttributeValues.attributes[attribute.id]}
              onChange={onAttributeChange}
            />
          ))}
        </Space>
      </div>
    </Card>
  );
}

const attributeOptions = [
  { label: 'Opposite', value: ATTRIBUTE_VALUE.OPPOSITE },
  { label: 'Unrelated', value: ATTRIBUTE_VALUE.UNRELATED },
  { label: 'Irrelevant', value: ATTRIBUTE_VALUE.IRRELEVANT },
  { label: 'Related', value: ATTRIBUTE_VALUE.RELATED },
  { label: 'Deterministic', value: ATTRIBUTE_VALUE.DETERMINISTIC },
];

type AttributionValueButtonsProps = {
  attribute: ItemAttributes;
  value?: number;
  onChange: (attributeId: string, value: number) => void;
};

function AttributionValueButtons({ attribute, value, onChange }: AttributionValueButtonsProps) {
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
