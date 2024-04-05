import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from './useItemQueryParams';
import { sample as lodashSample, shuffle } from 'lodash';
import { useState } from 'react';
import { ItemAtributesValues, ItemAttribute } from 'types';
import { App } from 'antd';

export function useItemSampler() {
  const { activeItem, attributesList, availableItemIds, addAttributesToUpdate, itemsAttributeValues } =
    useItemsAttributeValuesContext();
  const { searchParams } = useItemQueryParams();
  const { message } = App.useApp();

  const [sampleIds, setSampleIds] = useState<string[]>([]);
  const [attribute, setAttribute] = useState<ItemAttribute>();

  // Create sample
  const onGetSample = () => {
    const attributeKey = searchParams.get('attribute') ?? lodashSample(attributesList)?.id ?? 'ali';
    const selectedAttribute =
      attributesList.find((a) => a.id === attributeKey) ?? lodashSample(attributesList);
    const sampleSize = Number(searchParams.get('size')) || 9;

    const selected: string[] = [];
    const options = shuffle(availableItemIds);

    for (let i = 0; i < options.length; i++) {
      if (selected.length === sampleSize) break;

      const itemId = options[i];
      const currentAttributeValues = itemsAttributeValues?.[itemId]?.attributes ?? {};

      if (!currentAttributeValues[attributeKey]) {
        selected.push(itemId);
      }
    }

    setAttribute(selectedAttribute);
    setSampleIds(selected);
  };

  const updateAttributeValue = (itemId: string, attributeId: string, value: number) => {
    const currentItemAttributeValues = itemsAttributeValues[activeItem?.id] ?? {
      id: activeItem?.id,
      attributes: {},
    };
    console.log(currentItemAttributeValues);

    addAttributesToUpdate(itemId, {
      ...currentItemAttributeValues,
      attributes: {
        ...currentItemAttributeValues.attributes,
        [attributeId]: value,
      },
    });

    // message.error(`Error while trying to update attribute value for ${itemId} and ${attributeId}`);
  };

  return {
    sampleIds,
    itemsAttributeValues,
    attribute,
    onGetSample,
    updateAttributeValue,
  };
}
