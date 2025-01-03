import { Divider, Flex } from 'antd';
import { FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import type { ItemAttributesValues, ItemAttribute } from 'types';
import { deepCleanObject, getItemAttributePriorityResponse, sortJsonKeys } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';

import {
  ItemAttributionClassifierFilters,
  ItemAttributionComparatorFilters,
  ItemAttributionGroupingFilters,
  ItemAttributionSamplerFilters,
  ItemAttributionStats,
  ItemAttributionStatsFilters,
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
        options={['classifier', 'sampler', 'grouping', 'comparator', 'simulator', 'stats']}
      />
      <Divider />

      {view === 'classifier' && <ItemAttributionClassifierFilters />}
      {view === 'sampler' && <ItemAttributionSamplerFilters />}
      {view === 'grouping' && <ItemAttributionGroupingFilters />}
      {view === 'comparator' && <ItemAttributionComparatorFilters />}
      {view === 'stats' && <ItemAttributionStatsFilters />}
    </SiderContent>
  );
}

function prepareFileForDownload(
  itemsAttributes: Dictionary<ItemAttributesValues>,
  attributes: Dictionary<ItemAttribute>,
) {
  const total = Object.keys(attributes).length;

  Object.keys(itemsAttributes).forEach((key) => {
    const itemAttributeValues = itemsAttributes[key];

    // // TODO: Tempo Rename hol to gra (grab)
    // const originalHolValue = itemAttributeValues.attributes['hol'];
    // delete itemAttributeValues.attributes['hol'];
    // itemAttributeValues.attributes['gra'] = originalHolValue;

    // // TODO: TEMP Rename sol to har, and base values in soft
    // const originalSolValue = itemAttributeValues.attributes['sol'];
    // delete itemAttributeValues.attributes['sol'];
    // const softValue = itemAttributeValues.attributes['sof'];
    // if (softValue === ATTRIBUTE_VALUE.DETERMINISTIC) {
    //   itemAttributeValues.attributes['har'] = ATTRIBUTE_VALUE.OPPOSITE;
    // }
    // if (originalSolValue === ATTRIBUTE_VALUE.DETERMINISTIC) {
    //   itemAttributeValues.attributes['har'] = ATTRIBUTE_VALUE.DETERMINISTIC;
    // }

    // // TODO: TEMP Auto-add cold if warm
    // const warmValue = itemAttributeValues.attributes['war'];
    // if (warmValue === ATTRIBUTE_VALUE.DETERMINISTIC) {
    //   itemAttributeValues.attributes['col'] = ATTRIBUTE_VALUE.OPPOSITE;
    // }
    // if (warmValue === ATTRIBUTE_VALUE.OPPOSITE) {
    //   itemAttributeValues.attributes['col'] = ATTRIBUTE_VALUE.DETERMINISTIC;
    // }
    // if (warmValue === ATTRIBUTE_VALUE.RELATED) {
    //   itemAttributeValues.attributes['col'] = ATTRIBUTE_VALUE.UNCLEAR;
    // }

    // const bigValue = itemAttributeValues.attributes['big'];
    // if (bigValue === ATTRIBUTE_VALUE.RELATED) {
    //   itemAttributeValues.attributes['sma'] = ATTRIBUTE_VALUE.UNRELATED;
    // }
    // if (bigValue === ATTRIBUTE_VALUE.DETERMINISTIC) {
    //   itemAttributeValues.attributes['sma'] = ATTRIBUTE_VALUE.OPPOSITE;
    // }

    // Check completion
    const completed = Object.keys(itemAttributeValues.attributes).length;

    if (completed === total) {
      // Add completion
      itemAttributeValues.complete = true;

      // Add score
      let unclearCount = 0;
      itemAttributeValues.score = Object.values(itemAttributeValues.attributes).reduce((acc: number, v) => {
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

      // Add reliability
      itemAttributeValues.reliability = Math.floor(((completed - unclearCount) / total) * 100);

      // Add key with only relevant attributes
      itemAttributeValues.key = getItemAttributePriorityResponse(itemAttributeValues, attributes, true).join(
        '',
      );
    } else {
      itemAttributeValues.complete = undefined;
      itemAttributeValues.score = undefined;
      itemAttributeValues.reliability = undefined;
      itemAttributeValues.key = undefined;
    }
  });

  return sortJsonKeys(deepCleanObject(itemsAttributes));
}
