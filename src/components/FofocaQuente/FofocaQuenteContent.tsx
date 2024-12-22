import type { TeenageStudent } from 'types';
import './FofocaQuente.scss';
import type { useTDResource } from 'hooks/useTDResource';
import { useGridPagination } from 'hooks/useGridPagination';
import { Flex, Typography } from 'antd';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { StudentCard } from './StudentCard';
import { useFilterDataByDataFilters } from 'components/Common/DataFilters';

export type FofocaQuenteContentProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function FofocaQuenteContent({ data }: FofocaQuenteContentProps) {
  const filteredData = useFilterDataByDataFilters(data);

  const { page, pagination } = useGridPagination({
    data: filteredData,
    resetter: '',
    defaultPageSize: 64,
  });
  return (
    <>
      <>
        <Typography.Title level={2}>
          Listing - Fofoca Quente items ({filteredData.length} | {Object.values(data ?? {}).length})
        </Typography.Title>

        <PaginationWrapper pagination={pagination} className="full-width">
          <Flex gap={16} wrap="wrap">
            {page.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </Flex>
        </PaginationWrapper>
      </>
    </>
  );
}
