import { ContainerOutlined, FileTextOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep, orderBy } from 'lodash';
import type { UseEscapeRoomResourceReturnType } from 'pages/Games/EscapeRoom/useEscapeRoomResource';
import { sortJsonKeys } from 'utils';
import type { EscapeRoomDatabase } from './cards/escape-room-types';

export function EscapeRoomFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  hasNewData,
}: UseEscapeRoomResourceReturnType) {
  const { queryParams, addParams } = useQueryParams();
  return (
    <SiderContent>
      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(entriesToUpdate)}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={() => prepareFileForDownload(data)}
          disabled={isDirty}
          fileName="escape-room.json"
          hasNewData={hasNewData}
        />

        <FirestoreConsoleLink label="Firestore" path="/tdr/escapeRoom" />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        onChange={(mode) => addParams({ display: mode })}
        options={[
          {
            title: 'Sets',
            icon: <ContainerOutlined />,
            value: 'sets',
          },
          {
            title: 'Cards',
            icon: <FileTextOutlined />,
            value: 'cards',
          },
          {
            title: 'Create',
            icon: <PlusSquareOutlined />,
            value: 'create',
          },
        ]}
        value={queryParams.get('display') ?? 'sets'}
      />
    </SiderContent>
  );
}

function prepareFileForDownload(data: EscapeRoomDatabase) {
  const copy = cloneDeep(data);

  copy.missionSets = orderBy(
    copy.missionSets,
    [(item) => ['basic', 'medium', 'complex'].indexOf(item.difficulty), 'title', 'id'],
    ['asc', 'asc', 'asc'],
  );

  return sortJsonKeys(copy, []);
}
