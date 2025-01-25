import { Button, Flex, Select } from 'antd';
import { CARD_TYPES } from './types';
import { capitalize } from 'lodash';
import { FileAddOutlined } from '@ant-design/icons';
import { useQueryParams } from 'hooks/useQueryParams';
import { useState } from 'react';

const { Option } = Select;

const CARD_TYPES_OPTIONS = Object.values(CARD_TYPES).map((type) => ({
  label: capitalize(type),
  value: type,
}));

export function AddCardSelect() {
  const { addParam } = useQueryParams();
  const [cardType, setCardType] = useState(CARD_TYPES_OPTIONS[0].value);

  return (
    <Flex wrap="wrap" gap={8}>
      <Select value={cardType} style={{ width: 150 }} onChange={setCardType}>
        {CARD_TYPES_OPTIONS.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      <Button icon={<FileAddOutlined />} onClick={() => addParam('addCard', cardType)} />
    </Flex>
  );
}
