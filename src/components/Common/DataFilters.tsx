import { Form } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { FilterSelect } from './FilterEntries';

export function buildDataFilters<T extends PlainObject>(data: Dictionary<T>, ignoreKeys: string[] = []) {
  const keys = Object.keys(
    Object.values(data).reduce((acc: Dictionary<boolean>, entry) => {
      Object.keys(entry).forEach((key) => {
        if (!acc[key] && !ignoreKeys.includes(key)) {
          acc[key] = true;
        }
      });

      return acc;
    }, {}),
  );

  const sortableKeys: string[] = [];
  const filters: { label: string; options: { label: string; value: any }[] }[] = [];

  keys.forEach((key) => {
    const values = Object.values(data).map((entry) => entry[key]);
    const uniqueValues = Array.from(new Set(values));
    const uniqueValueRatio = uniqueValues.length / values.length;

    if (uniqueValueRatio >= 0.05) {
      sortableKeys.push(key);
    }

    if (uniqueValueRatio <= 0.9) {
      filters.push({
        label: key,
        options: [
          { label: 'All', value: '' },
          ...uniqueValues.sort().map((value) => ({ label: String(value), value })),
        ],
      });
    }
  });

  return { filters, sortableKeys };
}

type DataFiltersProps<T extends PlainObject> = {
  data: Dictionary<T>;
  ignoreKeys?: string[];
};

export function DataFilters<T extends PlainObject>({ data, ignoreKeys = [] }: DataFiltersProps<T>) {
  const { queryParams, addParam } = useQueryParams();
  const filters = useMemo(() => buildDataFilters(data, ignoreKeys), [data, ignoreKeys]);

  return (
    <Form layout="vertical">
      {filters.filters.map((filter) => (
        <FilterSelect
          key={filter.label}
          label={capitalize(filter.label)}
          onChange={(value) => addParam(filter.label.toLowerCase(), value)}
          options={filter.options}
          value={queryParams.get(filter.label.toLowerCase()) ?? ''}
        />
      ))}

      <FilterSelect
        label="Sort by"
        onChange={(value) => addParam('sort', value)}
        options={filters.sortableKeys.map((key) => ({ label: capitalize(key), value: key }))}
        value={queryParams.get('sort') ?? ''}
      />

      <FilterSelect
        label="Order"
        onChange={(value) => addParam('order', value)}
        options={[
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' },
        ]}
        value={queryParams.get('order') ?? 'asc'}
      />
    </Form>
  );
}

export function useFilterDataByDataFilters<T extends PlainObject>(data: Dictionary<T>) {
  const { queryParams } = useQueryParams();
  const filters = useMemo(() => buildDataFilters(data), [data]);
  const activeQueryParams = useMemo(() => {
    return Array.from(queryParams.entries())
      .filter(([key]) => {
        return filters.filters.some((filter) => filter.label.toLowerCase() === key);
      })
      .reduce((acc: Dictionary<any>, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [queryParams, filters]);

  const sortKey = queryParams.get('sort') ?? 'id';
  const order = queryParams.get('order') === 'desc' ? 'desc' : 'asc';

  return useMemo(() => {
    const allValues = Object.values(data);

    const filteredData = allValues.filter((entry) => {
      return Object.entries(activeQueryParams).every(([key, value]) => {
        return String(entry[key]) === value;
      });
    });
    return orderBy(filteredData, sortKey, order);
  }, [data, activeQueryParams, sortKey, order]);
}
