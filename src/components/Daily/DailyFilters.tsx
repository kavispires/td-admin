import { CalendarOutlined, CloudUploadOutlined, ContainerOutlined } from '@ant-design/icons';
import { FilterSegments } from 'components/Common';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';

export function DailyFilters() {
  const { queryParams, addParams } = useQueryParams();
  return (
    <>
      <SiderContent>
        <FilterSegments
          label="Display"
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
          value={queryParams.get('display') ?? 'population'}
        />
      </SiderContent>
      <SiderContent>
        <FirestoreConsoleLink label="History" path="/diario/history" />
      </SiderContent>
    </>
  );
}
