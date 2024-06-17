import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAttributionCard } from './ItemAttributionCard';
import { ItemAttributionNavigation } from './ItemAttributionNavigation';
import { Empty, Flex } from 'antd';
import { ItemSamplerCard } from './ItemSamplerCard';
import { ItemGroupingCard } from './ItemGroupingCard';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { ItemComparatorCard } from './ItemComparatorCard';
import { ItemSimulation } from './ItemSimulation';

export function ItemAttributionPageContent() {
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

  if (view === 'comparator') {
    return <ItemComparatorCard />;
  }

  if (view === 'simulator') {
    return <ItemSimulation />;
  }

  return <Empty className="my-10" description="Unknown view has been selected" />;
}
