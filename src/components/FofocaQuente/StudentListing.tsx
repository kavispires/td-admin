import { Flex, Typography } from 'antd';
import { useFilterDataByDataFilters } from 'components/Common/DataFilters';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import type { useTDResource } from 'hooks/useTDResource';
import type { TeenageStudent } from 'types/tdr';
import { StudentCard } from './StudentCard';

export type StudentListingProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function StudentListing({ data }: StudentListingProps) {
  const filteredData = useFilterDataByDataFilters(data);

  const { page, pagination } = useGridPagination({
    data: filteredData,
    resetter: '',
    defaultPageSize: 64,
  });
  return (
    <>
      <Typography.Title level={2}>
        Listing - Fofoca Quente items ({filteredData.length} | {Object.values(data ?? {}).length})
      </Typography.Title>

      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </Flex>
      </PaginationWrapper>
    </>
  );
}
