import { Button, Popover, Select } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FilterFilled,
  FilterOutlined,
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from '@ant-design/icons';

import { ItemsTypeahead } from '../ItemsTypeahead';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';

export function ItemAttributionNavigation() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  return (
    <Button.Group>
      <Button onClick={() => jumpToItem('first')} icon={<VerticalRightOutlined />}>
        First
      </Button>
      <Button onClick={() => jumpToItem('previous10')} icon={<DoubleLeftOutlined />}>
        Previous 10
      </Button>
      <Button onClick={() => jumpToItem('previous')} icon={<LeftOutlined />}>
        Previous
      </Button>
      <Button onClick={() => jumpToItem('next')}>
        Next <RightOutlined />
      </Button>
      <Button onClick={() => jumpToItem('next10')}>
        Next 10 <DoubleRightOutlined />
      </Button>
      <Button onClick={() => jumpToItem('last')}>
        Last <VerticalLeftOutlined />
      </Button>
      <Popover content={<GoToItemPopOverContent />} title="Go to item">
        <Button>Go To</Button>
      </Popover>
      <Button onClick={() => jumpToItem('incomplete')}>Next Incomplete</Button>
    </Button.Group>
  );
}

function GoToItemPopOverContent() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  return <ItemsTypeahead isPending={false} onFinish={(itemId) => jumpToItem('goTo', itemId)} />;
}

export function ItemAttributionFilterAttributes() {
  const { addParam, queryParams } = useQueryParams();

  const { attributesList } = useItemsAttributeValuesContext();

  const options = useMemo(
    () =>
      attributesList.map((attribute) => ({
        label: attribute.name.en,
        value: attribute.id,
      })),
    [attributesList],
  );

  const onChangeFilters = (values: string[]) => {
    addParam('filters', values.join(','));
  };

  const activeFilters = queryParams.get('filters');

  const content = (
    <Select
      mode="multiple"
      style={{ width: 300 }}
      options={options}
      value={activeFilters?.split(',')}
      onChange={(values) => onChangeFilters(values)}
      allowClear
    />
  );

  return (
    <Popover content={content} title="Filter Attributes">
      <Button>{activeFilters ? <FilterFilled style={{ color: 'gold' }} /> : <FilterOutlined />}</Button>
    </Popover>
  );
}
