import { DataFilters } from 'components/Common/DataFilters';
import { SiderContent } from 'components/Layout';
import type { useTDResource } from 'hooks/useTDResource';
import type { TeenageStudent } from 'types';

export type FofocaQuenteFiltersProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function FofocaQuenteFilters({ data }: FofocaQuenteFiltersProps) {
  return (
    <SiderContent>
      <DataFilters data={data} />
    </SiderContent>
  );
}
