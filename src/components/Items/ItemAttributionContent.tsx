import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAttributionCard } from './ItemAttributionCard';
import { ItemAttributionNavigation } from './ItemAttributionNavigation';
import { Card, Flex, Typography } from 'antd';
import { ItemSamplerCard } from './ItemSamplerCard';
import { ItemGroupingCard } from './ItemGroupingCard';
import { GoToTopButton } from 'components/Common/GoToTopButton';

export function ItemAttributionClassifierContent() {
  const { view } = useItemQueryParams();

  if (view === 'classifier') {
    return (
      <>
        <ItemAttributionNavigation />
        <ItemAttributionCard />
        <Flex justify="flex-end" className="my-4">
          <GoToTopButton />
        </Flex>
      </>
    );
  }

  if (view === 'sampler') {
    return <ItemSamplerCard />;
  }

  if (view === 'grouping') {
    return <ItemGroupingCard />;
  }

  return (
    <Card className="my-4">
      <Typography.Text type="secondary">Unknown view has been selected</Typography.Text>
    </Card>
  );
}
