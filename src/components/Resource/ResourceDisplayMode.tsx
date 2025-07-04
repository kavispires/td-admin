import { AppstoreOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';
import { FilterSegments } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';

export function ResourceDisplayMode() {
  const { queryParams, addParam } = useQueryParams();

  return (
    <SiderContent>
      <FilterSegments
        label="Display"
        onChange={(mode) => addParam('display', mode)}
        options={[
          {
            title: 'JSON',
            icon: <FileTextOutlined />,
            value: 'json',
          },
          {
            title: 'Table',
            icon: <TableOutlined />,
            value: 'table',
          },
          {
            title: 'Cards',
            icon: <AppstoreOutlined />,
            value: 'cards',
          },
        ]}
        value={queryParams.get('display') ?? 'json'}
      />
    </SiderContent>
  );
}
