import { DotChartOutlined, FileImageOutlined, FileJpgOutlined, TableOutlined } from '@ant-design/icons';
import { DataFilters } from '@components/Common/DataFilters';
import { FilterSegments } from '@components/Common/FilterEntries';
import { SiderContent } from '@components/Layout';
import { useQueryParams } from '@hooks/useQueryParams';
import type { useTDResource } from '@hooks/useTDResource';
import type { TeenageStudentData } from '@types';
import { Divider } from 'antd';

export type FofocaQuenteFiltersProps = ReturnType<typeof useTDResource<TeenageStudentData>>;

export function FofocaQuenteFilters({ data }: FofocaQuenteFiltersProps) {
  const { addParam, queryParams, is } = useQueryParams();
  return (
    <SiderContent>
      <FilterSegments
        label="Display"
        onChange={(mode) => addParam('display', mode)}
        options={[
          {
            title: 'Listing',
            icon: <TableOutlined />,
            value: 'listing',
          },
          {
            title: 'Stats',
            icon: <DotChartOutlined />,
            value: 'stats',
          },
        ]}
        value={queryParams.get('display') ?? 'listing'}
      />

      <FilterSegments
        label="Images"
        onChange={(mode) => addParam('imageVariant', mode)}
        options={[
          {
            title: 'TSC',
            icon: <FileJpgOutlined />,
            value: 'tsc',
          },
          {
            title: 'US-GB',
            icon: <FileImageOutlined />,
            value: 'gb',
          },
        ]}
        value={queryParams.get('imageVariant') ?? 'tsc'}
      />
      {!is('display', 'stats') && (
        <>
          <Divider />
          <DataFilters data={data} />
        </>
      )}
    </SiderContent>
  );
}
