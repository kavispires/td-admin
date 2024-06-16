import { Divider, Flex } from 'antd';
import { FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { ItemAtributesValues, ItemAttribute } from 'types';
import { getItemAttributePriorityResponse, sortJsonKeys } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';

import {
  ItemAttributionClassifierFilters,
  ItemAttributionComparatorFilters,
  ItemAttributionGroupingFilters,
  ItemAttributionSamplerFilters,
  ItemAttributionStats,
} from './ItemAttributionFiltersSections';

export function ItemAttributionFilters() {
  const { isDirty, save, prepareItemsAttributesFileForDownload, attributes, isSaving, attributesToUpdate } =
    useItemsAttributeValuesContext();

  const { view, setView } = useItemQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(attributesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(prepareItemsAttributesFileForDownload(), attributes)}
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
        options={['classifier', 'sampler', 'grouping', 'comparator']}
      />
      <Divider />

      {view === 'classifier' && <ItemAttributionClassifierFilters />}
      {view === 'sampler' && <ItemAttributionSamplerFilters />}
      {view === 'grouping' && <ItemAttributionGroupingFilters />}
      {view === 'comparator' && <ItemAttributionComparatorFilters />}
    </SiderContent>
  );
}

function prepareFileForDownload(
  itemsAttributes: Dictionary<ItemAtributesValues>,
  attributes: Dictionary<ItemAttribute>
) {
  const total = Object.keys(attributes).length;

  Object.keys(itemsAttributes).forEach((key) => {
    const itemAttributeValues = itemsAttributes[key];

    // Check completion
    const completed = Object.keys(itemAttributeValues.attributes).length;

    if (completed === total) {
      // Add completion
      itemAttributeValues.complete = true;

      // Add score
      let unclearCount = 0;
      const score = Object.values(itemAttributeValues.attributes).reduce((acc: number, v) => {
        if (v <= 0) {
          if (v === ATTRIBUTE_VALUE.UNCLEAR) {
            unclearCount += 1;
          }
          if (v === ATTRIBUTE_VALUE.OPPOSITE) {
            acc += v / 2;
          }
          return acc;
        }

        return acc + v;
      }, 0);
      itemAttributeValues.score = score;

      // Add reliability
      itemAttributeValues.reliability = Math.floor(((completed - unclearCount) / total) * 100);

      // Add key with only relevant attributes
      itemAttributeValues.key = getItemAttributePriorityResponse(itemAttributeValues, attributes, true).join(
        ''
      );
    }
  });

  return sortJsonKeys(itemsAttributes);
}
