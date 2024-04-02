import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

export function ItemAttributionNavigation() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  return (
    <Button.Group className="my-4">
      <Button onClick={() => jumpToItem('first')} icon={<VerticalRightOutlined />}>
        First
      </Button>
      <Button onClick={() => jumpToItem('-10')} icon={<DoubleLeftOutlined />}>
        Previous 10
      </Button>
      <Button onClick={() => jumpToItem('previous')} icon={<LeftOutlined />}>
        Previous
      </Button>
      <Button onClick={() => jumpToItem('next')}>
        Next <RightOutlined />
      </Button>
      <Button onClick={() => jumpToItem('+10')}>
        Next 10 <DoubleRightOutlined />
      </Button>
      <Button onClick={() => jumpToItem('last')}>
        Last <VerticalLeftOutlined />
      </Button>
    </Button.Group>
  );
}
