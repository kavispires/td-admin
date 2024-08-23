import { Flex, Typography } from 'antd';
import { Item } from 'components/Sprites';

type ThingProps = {
  itemId: string;
  name: string;
  width?: number;
};

export function Thing({ itemId, name, width = 50 }: ThingProps) {
  return (
    <Flex vertical align="center">
      <Item id={itemId} width={width} />
      <Typography.Text code key={itemId}>
        {name}
      </Typography.Text>
    </Flex>
  );
}
