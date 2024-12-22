import { SiderContent } from 'components/Layout';
import type { TeenageStudent } from 'types';
import type { useTDResource } from 'hooks/useTDResource';
import { DataFilters } from 'components/Common/DataFilters';

export type FofocaQuenteFiltersProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function FofocaQuenteFilters({ data }: FofocaQuenteFiltersProps) {
  return (
    <SiderContent>
      <DataFilters data={data} />
    </SiderContent>
  );
}
