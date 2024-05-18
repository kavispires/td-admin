import { Button, Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { ItemGroup } from 'types';
import { sortJsonKeys } from 'utils';

import { ClusterOutlined, TableOutlined } from '@ant-design/icons';

export function ItemsGroupsFilters({
  data,
  save,
  isDirty,
  isSaving,
}: UseResourceFirebaseDataReturnType<ItemGroup>) {
  const { queryParams, addParam, is } = useQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <Button
          block
          danger
          type="primary"
          loading={isSaving}
          disabled={!isDirty}
          onClick={save}
          size="large"
        >
          Save
        </Button>
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
        onChange={(mode) => addParam('display', mode)}
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
      />
    </SiderContent>
  );
}
function prepareFileForDownload(groups: Dictionary<ItemGroup>) {
  // TODO
  return sortJsonKeys(groups);
}
