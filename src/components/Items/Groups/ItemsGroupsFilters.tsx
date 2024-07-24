import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { ItemGroup } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';

import { ClusterOutlined, TableOutlined } from '@ant-design/icons';
import { SaveButton } from 'components/Common/SaveButton';
import { cloneDeep, isEmpty, omitBy } from 'lodash';

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
          dirt={JSON.stringify(prepareObjectToSave(entriesToUpdate))}
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

      {is('display', 'item') && (
        <FilterSwitch
          label="No Groups Only"
          value={is('emptyOnly')}
          onChange={(mode) => addParam('emptyOnly', mode, false)}
        />
      )}
    </SiderContent>
  );
}

function prepareObjectToSave(groups: Dictionary<ItemGroup>) {
  return omitBy(cloneDeep(groups), (group) => isEmpty(group.itemsIds));
}

function prepareFileForDownload(groups: Dictionary<ItemGroup>) {
  Object.keys(groups).forEach((key) => {
    groups[key].itemsIds = sortItemsIds(removeDuplicates(groups[key].itemsIds));
  });
  return sortJsonKeys(prepareObjectToSave(groups));
}
