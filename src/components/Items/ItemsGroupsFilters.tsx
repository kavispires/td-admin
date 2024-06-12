import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { ItemGroup } from 'types';
import { sortJsonKeys } from 'utils';

import { ClusterOutlined, TableOutlined } from '@ant-design/icons';
import { SaveButton } from 'components/Common/SaveButton';

export function ItemsGroupsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
}: UseResourceFirebaseDataReturnType<ItemGroup>) {
  const { queryParams, addParam, addParams, is } = useQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="items-groups.json"
          disabled={isDirty}
          block
        />
      </Flex>
      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'group'}
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1 })}
        options={[
          {
            title: 'By Groups',
            icon: <ClusterOutlined />,
            value: 'group',
          },
          {
            title: 'By Items',
            icon: <TableOutlined />,
            value: 'item',
          },
        ]}
      />

      <FilterSwitch
        label="No Groups Only"
        value={is('emptyOnly')}
        onChange={(mode) => addParam('emptyOnly', mode, false)}
        disabled={!is('display', 'item')}
      />
    </SiderContent>
  );
}
function prepareFileForDownload(groups: Dictionary<ItemGroup>) {
  // TODO
  return sortJsonKeys(groups);
}
