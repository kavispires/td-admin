import { Button, Divider, Flex } from 'antd';
import { FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAtributesValues } from 'types';
import { sortJsonKeys } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';

import {
  ItemAttributionClassifierFilters,
  ItemAttributionSamplerFilters,
  ItemAttributionStats,
} from './ItemAttributionFilersSections';

export function ItemAttributionFilters() {
  const { isDirty, save, itemsAttributeValues, attributesList } = useItemsAttributeValuesContext();

  const { view, setView } = useItemQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <Button block danger type="primary" disabled={!isDirty} onClick={save} size="large">
          Save
        </Button>
        <DownloadButton
          data={() => prepareFileForDownload(itemsAttributeValues, attributesList.length)}
          fileName="items-attribute-values.json"
          disabled={isDirty}
          block
        />
      </Flex>
      <Divider />

      <ItemAttributionStats />

      <FilterSelect
        label="View"
        value={view}
        onChange={setView}
        options={['classifier', 'sampler', 'stats']}
      />
      <Divider />

      {view === 'classifier' && <ItemAttributionClassifierFilters />}
      {view === 'sampler' && <ItemAttributionSamplerFilters />}
    </SiderContent>
  );
}

function prepareFileForDownload(
  itemsAttributeValues: Dictionary<ItemAtributesValues>,
  totalAttributes: number
) {
  return sortJsonKeys(
    Object.values(itemsAttributeValues).reduce((acc: Dictionary<ItemAtributesValues>, item) => {
      // Assess item completion
      if (Object.keys(item.attributes).length === totalAttributes) {
        item.complete = true;
      } else {
        delete item.complete;
      }

      // Verify -4/-5 beef
      Object.keys(item.attributes).forEach((key) => {
        if (item.attributes[key] === -5 || item.attributes[key] === -4) {
          item.attributes[key] = ATTRIBUTE_VALUE.UNRELATED;
        }
      });

      acc[item.id] = item;

      return acc;
    }, {})
  );
}
