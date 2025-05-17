import { Empty, Flex } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useQueryParams } from 'hooks/useQueryParams';
import { ItemAttributionCard } from './ItemAttributionCard';
import {
  ItemAttributionFilterAttributes,
  ItemAttributionNavigation,
  ItemAttributionSortBy,
} from './ItemAttributionNavigation';
import { ItemComparatorCard } from './ItemComparatorCard';
import { ItemGroupingCard } from './ItemGroupingCard';
import { ItemSamplerCard } from './ItemSamplerCard';
import { ItemSimulation } from './ItemSimulation';
import { ItemStats } from './ItemStats';

export function ItemAttributionPageContent() {
  const { queryParams } = useQueryParams();
  const display = queryParams.get('display') ?? 'classifier';

  if (display === 'classifier') {
    return (
      <>
        <Flex className="my-4" gap={8}>
          <ItemAttributionNavigation />
          <ItemAttributionFilterAttributes />
          <ItemAttributionSortBy />
        </Flex>
        <ItemAttributionCard />
        <Flex justify="flex-end" className="my-4">
          <GoToTopButton />
        </Flex>
      </>
    );
  }

  if (display === 'sampler') {
    return <ItemSamplerCard />;
  }

  if (display === 'grouping') {
    return <ItemGroupingCard />;
  }

  if (display === 'comparator') {
    return <ItemComparatorCard />;
  }

  if (display === 'simulator') {
    return <ItemSimulation />;
  }

  if (display === 'stats') {
    return <ItemStats />;
  }

  return <Empty className="my-10" description="Unknown display has been selected" />;
}
