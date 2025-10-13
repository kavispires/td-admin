import { Flex, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { Item } from 'components/Sprites';
import type { DailyDiagramItem } from 'types';

type ThingProps = {
  itemId: string;
  name: string;
  width?: number;
};

export function Thing({ itemId, name, width = 50 }: ThingProps) {
  return (
    <Flex align="center" vertical>
      <Item itemId={itemId} width={width} />
      <Typography.Text code key={itemId}>
        {name}
      </Typography.Text>
    </Flex>
  );
}

type ThingButtonProps = {
  thing: DailyDiagramItem;
  onActivateThing: (thing: DailyDiagramItem) => void;
  width?: number;
};

export function ThingButton({ thing, width = 50, onActivateThing }: ThingButtonProps) {
  return (
    <TransparentButton onClick={() => onActivateThing(thing)}>
      <Thing itemId={thing.itemId} name={thing.name} width={width} />
    </TransparentButton>
  );
}
