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
import { Button, Popover, Select, Space } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import { ItemsTypeahead } from '../ItemsTypeahead';

export function ItemAttributionNavigation() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  return (
    <Space.Compact>
      <Button icon={<VerticalRightOutlined />} onClick={() => jumpToItem('first')}>
        First
      </Button>
      <Button icon={<DoubleLeftOutlined />} onClick={() => jumpToItem('previous10')}>
        Previous 10
      </Button>
      <Button icon={<LeftOutlined />} onClick={() => jumpToItem('previous')}>
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
    </Space.Compact>
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
      allowClear
      mode="multiple"
      onChange={(values) => onChangeFilters(values)}
      options={options}
      style={{ width: 300 }}
      value={activeFilters?.split(',')}
    />
  );

  return (
    <Popover content={content} title="Filter Attributes">
      <Button>{activeFilters ? <FilterFilled style={{ color: 'gold' }} /> : <FilterOutlined />}</Button>
    </Popover>
  );
}

export function ItemAttributionSortBy() {
  const { addParam, queryParams } = useQueryParams();

  const options = [
    {
      label: 'Id',
      value: 'id',
    },
    {
      label: 'Updated At',
      value: 'updatedAt',
    },
    {
      label: 'Fewest Attributes Left',
      value: 'fewestAttributesLeft',
    },
  ];

  const activeSortBy = queryParams.get('sortBy');

  const content = (
    <Select
      allowClear
      onChange={(value) => addParam('sortBy', value)}
      options={options}
      style={{ width: 120 }}
      value={activeSortBy}
    />
  );

  return (
    <Popover content={content} title="Sort By">
      <Button>Sort</Button>
    </Popover>
  );
}
