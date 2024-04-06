import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAttributionCard } from './ItemAttributionCard';
import { ItemAttributionNavigation } from './ItemAttributionNavigation';
import { Card, Typography } from 'antd';
import { ItemSamplerCard } from './ItemSamplerCard';
import { ItemGroupingCard } from './ItemGroupingCard';

export function ItemAttributionClassifierContent() {
  const { view } = useItemQueryParams();

  if (view === 'classifier') {
    return (
      <>
        <ItemAttributionNavigation />
        <ItemAttributionCard />
        <ItemAttributionNavigation />
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
