import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { sample as lodashSample, shuffle } from 'lodash';
import { useMemo, useState } from 'react';
import { ItemAttribute } from 'types';

import { useItemQueryParams } from './useItemQueryParams';

export function useItemSampler() {
  const { attributesList, availableItemIds, addAttributesToUpdate, getItemAttributeValues } =
    useItemsAttributeValuesContext();
  const { searchParams } = useItemQueryParams();

  const [sampleIds, setSampleIds] = useState<string[]>([]);
  const [attribute, setAttribute] = useState<ItemAttribute>();

  const getSample = () => {
    const attributeKey = searchParams.get('attribute') ?? lodashSample(attributesList)?.id ?? 'ali';
    const selectedAttribute =
      attributesList.find((a) => a.id === attributeKey) ?? lodashSample(attributesList);
    const sampleSize = Number(searchParams.get('size')) || 9;

    const selected: string[] = [];
    const options = shuffle(availableItemIds);

    for (let i = 0; i < options.length; i++) {
      if (selected.length === sampleSize) break;

      const itemId = options[i];
      const currentAttributeValues = getItemAttributeValues(itemId).attributes;

      if (!currentAttributeValues[attributeKey]) {
        selected.push(itemId);
      }
    }

    return {
      selectedAttribute,
      selected,
    };
  };

  // Create sample
  const onGetSample = () => {
    let tempSample = getSample();
    let attempts = 0;
    while (tempSample.selected.length === 0 && attempts < 30) {
      tempSample = getSample();
      attempts++;
    }

    setAttribute(tempSample.selectedAttribute);
    setSampleIds(tempSample.selected);
  };

  const itemsLeftForAttribute = useMemo(() => {
    if (!attribute) return 0;

    return availableItemIds.filter((id) => !getItemAttributeValues(id).attributes[attribute?.id]).length;
  }, [attribute, availableItemIds]);

  const updateAttributeValue = (itemId: string, attributeId: string, value: number) => {
    const currentItemAttributeValues = getItemAttributeValues(itemId);

    addAttributesToUpdate(itemId, {
      ...currentItemAttributeValues,
      attributes: {
        ...currentItemAttributeValues.attributes,
        [attributeId]: value,
      },
    });
  };

  return {
    sampleIds,
    attribute,
    itemsLeftForAttribute,
    onGetSample,
    updateAttributeValue,
  };
}
