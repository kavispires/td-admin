import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useMemo, useState } from 'react';

import { orderBy } from 'lodash';
import { ATTRIBUTE_VALUE } from 'utils/constants';
import { useItemQueryParams } from './useItemQueryParams';

export function useItemGrouping() {
  const {
    attributesList,
    addAttributesToUpdate,
    getItemAttributeValues,
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

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const group = useMemo(() => {
    const itemsAttributes = availableItemIds.map((id) => getItemAttributeValues(id));
    const scopeValue =
      scope === 'unset' ? undefined : ATTRIBUTE_VALUE[scope.toUpperCase() as keyof typeof ATTRIBUTE_VALUE];

    const filteredItemIds = itemsAttributes
      .filter((item) => item.attributes?.[attributeKey] === scopeValue)
      .map((item) => item.id);

    const [sortType, sortValue] = (sortBy ?? '::').split('::');

    return orderBy(
      filteredItemIds,
      [
        (id) => (sortType === 'attribute' ? getItemAttributeValues(id)?.attributes?.[sortValue] : true),
        (id) => (sortType === 'prop' ? Number(id) : true),
        (id) => getItemAttributeValues(id)?.updatedAt,
        (id) => Number(id),
      ],
      [sortOrder, 'asc', 'desc', 'asc'],
    );
  }, [attributeKey, scope, sortBy, sortOrder]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const pageIds = useMemo(() => {
    if (previousAttribute !== attributeKey || previousScope !== scope) {
      setPreviousAttribute(attributeKey);
      setPreviousScope(scope);
      addQueryParam('page', '1');
      return group.slice(0, Number(pageSize));
    }

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);

    return group.slice(start, end);
  }, [page, pageSize, group]);

  const attribute = attributesList.find((a) => a.id === attributeKey);

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

  const updatePageItemsAsUnrelated = () => {
    addMultipleAttributesToUpdate(
      pageIds.map((id) => {
        const prev = getItemAttributeValues(id);
        if (!prev.attributes[attributeKey]) {
          prev.attributes[attributeKey] = ATTRIBUTE_VALUE.UNRELATED;
        }

        return prev;
      }),
    );
  };

  return {
    group,
    stats: {
      total: availableItemIds.length,
      group: group.length,
      percent: Math.round((group.length / availableItemIds.length) * 100),
    },
    pageIds,
    attribute,
    updateAttributeValue,
    updatePageItemsAsUnrelated,
    sorting: {
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
    },
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
