import { Button, Divider, Flex, Typography } from 'antd';
import { Stat } from 'components/Common/Stat';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useMemo } from 'react';

export function ItemAttributionStats() {
  const { itemsAttributeValues, availableItemIds } = useItemsAttributeValuesContext();

  const { total, complete, completionPercentage, hasDataCount, initiatedPercentage } = useMemo(() => {
    const total = availableItemIds.length;
    const someData = Object.keys(itemsAttributeValues).length;
    const complete = Object.values(itemsAttributeValues).filter(({ complete }) => Boolean(complete)).length;

    return {
      total,
      complete,
      completionPercentage: total > 0 ? Math.round((complete / total) * 100) : 0,
      hasDataCount: someData,
      initiatedPercentage: total > 0 ? Math.round((someData / total) * 100) : 0,
    };
  }, [itemsAttributeValues, availableItemIds.length]);

  return (
    <>
      <Flex vertical>
        <Typography.Text strong className="mb-2">
          Item Stats
        </Typography.Text>
        <Stat label="Total">{total}</Stat>
        <Stat label="Complete">
          {complete} ({completionPercentage}%)
        </Stat>
        <Stat label="Initiated">
          {hasDataCount} ({initiatedPercentage}%)
        </Stat>
      </Flex>
      <Divider />
    </>
  );
}

export function ItemAttributionClassifierFilters() {
  const { jumpToItem } = useItemsAttributeValuesContext();

  return (
    <>
      <Button block onClick={() => jumpToItem('random')}>
        Random Item
      </Button>
    </>
  );
}
