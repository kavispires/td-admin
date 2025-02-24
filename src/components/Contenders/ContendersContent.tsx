import type { ContenderCard } from 'types';
import './Contenders.scss';
import { Flex, Typography } from 'antd';
import { useFilterDataByDataFilters } from 'components/Common/DataFilters';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import type { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { ContenderEditCard } from './ContenderEditCard';

export type ContendersContentProps = ReturnType<typeof useResourceFirebaseData<ContenderCard>>;

export function ContendersContent({ data, addEntryToUpdate }: ContendersContentProps) {
  const filteredData = useFilterDataByDataFilters(data);

  const { page, pagination } = useGridPagination({
    data: filteredData,
    resetter: '',
    defaultPageSize: 32,
  });
  return (
    <>
      <>
        <Typography.Title level={2}>
          Listing - Contenders ({filteredData.length} | {Object.values(data ?? {}).length})
        </Typography.Title>

        <PaginationWrapper pagination={pagination} className="full-width">
          <Flex gap={16} wrap="wrap">
            {page.map((entry) => (
              <ContenderEditCard key={entry.id} contender={entry} addEntryToUpdate={addEntryToUpdate} />
            ))}
          </Flex>
        </PaginationWrapper>
      </>
    </>
  );
}
