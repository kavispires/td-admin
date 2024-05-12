import { AutoComplete, AutoCompleteProps, Input } from 'antd';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { Item } from 'types';

type ItemsTypeaheadProps = {
  items?: Dictionary<Item>;
  isPending?: boolean;
  onFinish: (id: string) => void;
} & Omit<AutoCompleteProps, 'options'>;

export function ItemsTypeahead({
  items,
  isPending,
  style,
  size,
  placeholder,
  allowClear,
  onFinish,
  ...rest
}: ItemsTypeaheadProps) {
  const tdrItemsQuery = useTDResource<Item>('items', !Boolean(items) && !isPending);

  const { namesDict, options } = useMemo(() => {
    console.log('Recomputing item names typeahead...');

    const namesDict = Object.values(items ?? tdrItemsQuery.data ?? {}).reduce(
      (acc: Dictionary<string>, entry) => {
        const nameEn = `${entry.name.en} (${entry.id})`;
        const namePt = `${entry.name.pt} (${entry.id})`;
        acc[nameEn] = entry.id;
        acc[namePt] = entry.id;
        return acc;
      },
      {}
    );

    const options = orderBy(Object.keys(namesDict), [(name) => name.toLowerCase()]).map((name) => ({
      value: name,
    }));

    return { namesDict, options };
  }, [items, isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const [filteredOptions, setFilteredOptions] = useState<{ value: string }[]>([]);

  const handleSearch = (searchText: string) => {
    const SEARCH = searchText.trim();
    const filtered = options.filter((option) =>
      String(option?.value ?? '')
        .toUpperCase()
        .includes(SEARCH)
    );
    const sorted = orderBy(filtered, [
      (option) => {
        const value = String(option?.value ?? '');
        if (value.includes(`${SEARCH} `)) return -1;
        const index = value.toUpperCase().indexOf(SEARCH);
        return index === 0 ? -1 : index === -1 ? value.length : index;
      },
    ]);
    setFilteredOptions(sorted);
  };

  const handlePressEnter = () => {
    if (filteredOptions.length > 0) {
      const key = filteredOptions[0].value;
      if (namesDict[key] !== undefined) {
        onFinish(namesDict[key]);
      }
    }
  };

  const onSelect = (key: any) => {
    if (namesDict[key] !== undefined) {
      onFinish(namesDict[key]);
    }
  };

  return (
    <AutoComplete
      options={options}
      style={{ width: 250, ...style }}
      allowClear={allowClear ?? true}
      placeholder={placeholder ?? 'Search by name or id...'}
      filterOption={(inputValue, option) =>
        String(option?.value ?? '')
          .toUpperCase()
          .indexOf(inputValue?.toUpperCase()) !== -1
      }
      onSearch={handleSearch}
      notFoundContent="No items found"
      onSelect={onSelect}
      {...rest}
    >
      <Input onPressEnter={handlePressEnter} />
    </AutoComplete>
  );
}
