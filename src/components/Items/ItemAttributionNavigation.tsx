import { Button, Popover } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useTDResource } from 'hooks/useTDResource';
import { Item } from 'types';

import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from '@ant-design/icons';

import { ItemsTypeahead } from './ItemsTypeahead';

export function ItemAttributionNavigation() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  return (
    <Button.Group className="my-4">
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
      <Popover content={<GoToItemPopOverContent />} title="Title">
        <Button>Go To</Button>
      </Popover>
    </Button.Group>
  );
}

function GoToItemPopOverContent() {
  const tdrItemsQuery = useTDResource<Item>('items');
  const { jumpToItem } = useItemsAttributeValuesContext();
  return (
    <ItemsTypeahead
      items={tdrItemsQuery.data ?? {}}
      isPending={false}
      onFinish={(itemId) => jumpToItem('goTo', itemId)}
    />
  );
}
