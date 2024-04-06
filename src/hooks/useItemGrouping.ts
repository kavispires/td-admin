import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useMemo, useState } from 'react';

import { useItemQueryParams } from './useItemQueryParams';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import { orderBy } from 'lodash';

export function useItemGrouping() {
  const {
    attributesList,
    addAttributesToUpdate,
    itemsAttributeValues,
    availableItemIds,
    addMultipleAttributesToUpdate,
  } = useItemsAttributeValuesContext();
  const { searchParams, addQueryParam } = useItemQueryParams();

  const attributeKey = searchParams.get('attribute') ?? 'ali';
  const scope = searchParams.get('scope') ?? 'unset';

  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '12';

  const [previousAttribute, setPreviousAttribute] = useState<string>('ali');
  const [previousScope, setPreviousScope] = useState<string>('unset');

  const group = useMemo(() => {
    if (scope === 'unset') {
      const notInitiatedItemIds = availableItemIds.filter((id) => !itemsAttributeValues[id]);
      const unsetItems = Object.values(itemsAttributeValues)
        .filter((item) => item.attributes?.[attributeKey] === undefined)
        .map((item) => item.id);

      return orderBy(
        [...notInitiatedItemIds, ...unsetItems],
        [(id) => itemsAttributeValues[id]?.updatedAt, (id) => Number(id)],
        ['desc', 'asc']
      );
    }

    const scopeValue = ATTRIBUTE_VALUE[scope.toUpperCase() as keyof typeof ATTRIBUTE_VALUE];

    return orderBy(
      Object.values(itemsAttributeValues).reduce((acc: string[], item) => {
        const value = item.attributes?.[attributeKey];

        if (value === scopeValue) {
          acc.push(item.id);
        }

        return acc;
      }, []),
      [(id) => itemsAttributeValues[id]?.updatedAt, (id) => Number(id)],
      ['desc', 'asc']
    );
  }, [attributeKey, scope, itemsAttributeValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageIds = useMemo(() => {
    if (previousAttribute !== attributeKey || previousScope !== scope) {
      setPreviousAttribute(attributeKey);
      setPreviousScope(scope);
      return group.slice(0, Number(pageSize));
    }

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);

    return group.slice(start, end);
  }, [page, pageSize, group]); // eslint-disable-line react-hooks/exhaustive-deps

  const attribute = attributesList.find((a) => a.id === attributeKey);

  const updateAttributeValue = (itemId: string, attributeId: string, value: number) => {
    const currentItemAttributeValues = itemsAttributeValues[itemId] ?? {
      id: itemId,
      attributes: {},
    };

    addAttributesToUpdate(itemId, {
      ...currentItemAttributeValues,
      attributes: {
        ...currentItemAttributeValues.attributes,
        [attributeId]: value,
      },
    });
  };

  const updatePageItemsAsUnrelated = () => {
    addMultipleAttributesToUpdate(
      pageIds.map((id) => {
        const prev = itemsAttributeValues[id] ?? { id, attributes: {} };
        if (!prev.attributes[attributeKey]) {
          prev.attributes[attributeKey] = ATTRIBUTE_VALUE.UNRELATED;
        }

        return prev;
      })
    );
  };

  return {
    group,
    pageIds,
    attribute,
    updateAttributeValue,
    updatePageItemsAsUnrelated,
    pagination: {
      total: group.length,
      current: Number(page),
      pageSize: Number(pageSize),
      onChange: (page: number) => addQueryParam('page', String(page)),
      onShowSizeChange: (_: number, pageSize: number) => addQueryParam('pageSize', String(pageSize)),
      pageSizeOptions: [12, 24, 48, 96],
    },
  };
}
