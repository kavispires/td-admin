import { Empty, Flex } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAttributionCard } from './ItemAttributionCard';
import { ItemAttributionFilterAttributes, ItemAttributionNavigation } from './ItemAttributionNavigation';
import { ItemComparatorCard } from './ItemComparatorCard';
import { ItemGroupingCard } from './ItemGroupingCard';
import { ItemSamplerCard } from './ItemSamplerCard';
import { ItemSimulation } from './ItemSimulation';
import { ItemStats } from './ItemStats';

export function ItemAttributionPageContent() {
  const { view } = useItemQueryParams();

  if (view === 'classifier') {
    return (
      <>
        <Flex className="my-4" gap={8}>
          <ItemAttributionNavigation />
          <ItemAttributionFilterAttributes />
        </Flex>
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

  if (view === 'comparator') {
    return <ItemComparatorCard />;
  }

  if (view === 'simulator') {
    return <ItemSimulation />;
  }

  if (view === 'stats') {
    return <ItemStats />;
  }

  return <Empty className="my-10" description="Unknown view has been selected" />;
}
