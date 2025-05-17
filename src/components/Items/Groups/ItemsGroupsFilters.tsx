import { ClusterOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep, isEmpty, omitBy } from 'lodash';
import type { Item, ItemGroup } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';
import { AddNewGroupFlow } from './AddNewGroupFlow';

export function ItemsGroupsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<ItemGroup>) {
  const { queryParams, addParam, addParams, is } = useQueryParams();
  const tdrItemsQuery = useTDResource<Item>('items');

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
          data={() => prepareFileForDownload(data, tdrItemsQuery.data)}
          fileName="items-groups.json"
          disabled={isDirty || isEmpty(tdrItemsQuery.data)}
          hasNewData={hasFirestoreData}
          block
        />
      </Flex>
      <Divider />

      <AddNewGroupFlow data={data} addEntryToUpdate={addEntryToUpdate} />

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

function prepareFileForDownload(groups: Dictionary<ItemGroup>, items: Dictionary<Item>) {
  Object.keys(groups).forEach((key) => {
    groups[key].itemsIds = sortItemsIds(removeDuplicates(groups[key].itemsIds));

    const totalItems = groups[key].itemsIds.length;
    const nsfwCount = groups[key].itemsIds.filter((itemId) => items[itemId].nsfw).length;
    // If more than 30% of the items are NSFW, mark the group as NSFW
    if (nsfwCount > totalItems * 0.3) {
      groups[key].nsfw = true;
      console.log(
        `😈 Group ${groups[key].name.pt} has ${nsfwCount} (${Math.round((nsfwCount / totalItems) * 100)}%) NSFW items`,
      );
    }
  });

  return sortJsonKeys(prepareObjectToSave(groups));
}
