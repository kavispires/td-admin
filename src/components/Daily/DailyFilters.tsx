import { CalendarOutlined, CloudUploadOutlined, ContainerOutlined } from '@ant-design/icons';
import { FilterSegments } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';

export function DailyFilters() {
  const { queryParams, addParams } = useQueryParams();
  return (
    <>
      <SiderContent>
        <FilterSegments
          label="Display"
          value={queryParams.get('display') ?? 'population'}
          onChange={(mode) => addParams({ display: mode })}
          options={[
            {
              title: 'Population',
              icon: <CloudUploadOutlined />,
              value: 'population',
            },
            {
              title: 'Check',
              icon: <CalendarOutlined />,
              value: 'check',
            },
            {
              title: 'Archive',
              icon: <ContainerOutlined />,
              value: 'archive',
            },
          ]}
        />
      </SiderContent>
    </>
  );
}
