import { FileImageOutlined, UserOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import type { DrawingData } from 'types';
import { sortJsonKeys } from 'utils';

type ArteRuimDrawingsFiltersProps = ReturnType<typeof useDrawingsResourceData>;

export function ArteRuimDrawingsFilters(query: ArteRuimDrawingsFiltersProps) {
  const { queryParams, addParam } = useQueryParams();
  const language = queryParams.get('language');
  return (
    <SiderContent>
      <Flex gap={12} vertical>
        <DownloadButton
          block
          data={() => prepareFileForDownload(query.drawings)}
          disabled={!language}
          fileName={`arte-ruim-drawings-${language}.json`}
          hasNewData={query.hasFirestoreData}
        />
      </Flex>
      <Divider />

      <FilterSelect
        label="Language"
        onChange={(v) => addParam('language', v)}
        options={['--', 'pt', 'en']}
        value={queryParams.get('language') ?? '--'}
      />

      <FilterSegments
        label="Type"
        onChange={(v) => addParam('display', v)}
        options={[
          {
            value: 'drawings',
            title: 'Drawings',
            icon: <FileImageOutlined />,
          },
          {
            value: 'artists',
            title: 'Artists',
            icon: <UserOutlined />,
          },
        ]}
        value={queryParams.get('display') ?? 'artists'}
      />
    </SiderContent>
  );
}

function prepareFileForDownload(drawings: Dictionary<DrawingData>) {
  return sortJsonKeys(drawings);
}
