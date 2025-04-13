import { Divider, Flex } from 'antd';
import { FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import type { ItemAttribute, ItemAttributesValues } from 'types';
import { deepCleanObject, sortJsonKeys } from 'utils';

import { calculateItemReliability, calculateItemScore, constructItemSignature } from '../utils';
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

    // const toolValue = itemAttributeValues.attributes.too;
    // const accessoryValue = itemAttributeValues.attributes.acc;
    // const instrumentValue = itemAttributeValues.attributes.ins;
    // let changed = false;
    // const toBeChanged =
    //   (toolValue > 0 || accessoryValue > 0 || instrumentValue > 0) &&
    //   (!toolValue ||
    //     toolValue < 0 ||
    //     !accessoryValue ||
    //     accessoryValue < ATTRIBUTE_VALUE.UNCLEAR ||
    //     !instrumentValue ||
    //     instrumentValue < ATTRIBUTE_VALUE.UNCLEAR);
    // if (toBeChanged) {
    //   console.log('id', itemAttributeValues.id);
    //   console.log(toolValue, accessoryValue, instrumentValue);
    // }

    // if (toolValue > 0) {
    //   console.log('tool is set resetting the rest');
    //   if (!accessoryValue || accessoryValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting accessory');
    //     changed = true;
    //     itemAttributeValues.attributes.acc = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    //   if (!instrumentValue || instrumentValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting instrument');
    //     changed = true;
    //     itemAttributeValues.attributes.ins = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    // }

    // if (accessoryValue > 0) {
    //   console.log('accessory is set resetting the rest');
    //   if (!toolValue || toolValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting tool');
    //     changed = true;
    //     itemAttributeValues.attributes.too = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    //   if (!instrumentValue || instrumentValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting instrument');
    //     changed = true;
    //     itemAttributeValues.attributes.ins = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    // }

    // if (instrumentValue > 0) {
    //   console.log('instrument is set resetting the rest');
    //   if (!toolValue || toolValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting tool');
    //     changed = true;
    //     itemAttributeValues.attributes.too = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    //   if (!accessoryValue || accessoryValue < ATTRIBUTE_VALUE.UNCLEAR) {
    //     console.log('resetting accessory');
    //     changed = true;
    //     itemAttributeValues.attributes.acc = ATTRIBUTE_VALUE.UNCLEAR;
    //   }
    // }

    // if (toBeChanged) {
    //   if (changed) {
    //     console.log(
    //       itemAttributeValues.attributes.too,
    //       itemAttributeValues.attributes.acc,
    //       itemAttributeValues.attributes.ins,
    //     );
    //   } else {
    //     console.log('no change');
    //   }

    //   console.log('-----------------');
    // }

    // Remove any key that is not an attribute
    const attributeKeys = Object.keys(itemAttributeValues.attributes);
    attributeKeys.forEach((k) => {
      if (!attributes[k]) {
        delete itemAttributeValues.attributes[k];
      }
    });

    // Check completion
    const completed = attributeKeys.length;

    if (completed === total) {
      // Add completion
      itemAttributeValues.complete = true;

      // Add score
      itemAttributeValues.score = calculateItemScore(itemAttributeValues);

      // Add reliability
      itemAttributeValues.reliability = calculateItemReliability(itemAttributeValues, total);

      // Add signature with only relevant attributes
      itemAttributeValues.signature = constructItemSignature(itemAttributeValues, attributes, {
        onlyRelevant: true,
      });
    } else {
      itemAttributeValues.complete = undefined;
      itemAttributeValues.score = undefined;
      itemAttributeValues.reliability = undefined;
      itemAttributeValues.signature = undefined;
    }
  });

  // TEMP
  const slimVersion: any = {};
  Object.values(itemsAttributes).forEach((itemAttributeValues) => {
    slimVersion[itemAttributeValues.id] = {
      id: itemAttributeValues.id,

      updatedAt: itemAttributeValues.updatedAt,
      signature: constructItemSignature(itemAttributeValues, attributes, {
        delimiter: ':',
        // TODO: it should return attributes by key, not priority
      }),
    };

    if (itemAttributeValues.complete) {
      slimVersion[itemAttributeValues.id].complete = itemAttributeValues.complete;
    }
  });
  console.log(slimVersion);

  return sortJsonKeys(deepCleanObject(itemsAttributes));
}
