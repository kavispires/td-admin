import { AutoComplete, type AutoCompleteProps, Input } from 'antd';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import type { Item } from 'types';

type ItemsTypeaheadProps = {
  items?: Dictionary<Item>;
  isPending?: boolean;
  onFinish: (id: string) => void;
  onFinishMultiple?: (ids: string[]) => void;
} & Omit<AutoCompleteProps, 'options'>;

export function ItemsTypeahead({
  items,
  isPending,
  style,
  size,
  placeholder,
  allowClear,
  onFinish,
  onFinishMultiple,
  ...rest
}: ItemsTypeaheadProps) {
  const tdrItemsQuery = useTDResource<Item>('items', !items && !isPending);

  // biome-ignore lint/correctness/useExhaustiveDependencies: on purpose
  const { namesDict, options } = useMemo(() => {
    console.log('Recomputing item names typeahead...');

    const namesDict = Object.values(items ?? tdrItemsQuery.data ?? {}).reduce(
      (acc: Dictionary<string>, entry) => {
        const nameEn = `${entry.name.en} (${entry.id})`;
        const namePt = `${entry.name.pt} (${entry.id})`;
        acc[nameEn] = entry.id;
        acc[namePt] = entry.id;
        // Other names
        if (entry.aliasesEn) {
          entry.aliasesEn.forEach((alias) => {
            acc[`${alias} (${entry.id})*`] = entry.id;
          });
        }
        if (entry.aliasesPt) {
          entry.aliasesPt.forEach((alias) => {
            acc[`${alias} (${entry.id})*`] = entry.id;
          });
        }

        return acc;
      },
      {},
    );

    const options = orderBy(Object.keys(namesDict), [(name) => name.toLowerCase()]).map((name) => ({
      value: name,
    }));

    return { namesDict, options };
  }, [items, isPending]);

  const [filteredOptions, setFilteredOptions] = useState<{ value: string }[]>([]);
  const [typedText, setTypedText] = useState('');

  useDebounce(
    () => {
      if (typedText) {
        handleSearch(typedText);
      }
    },
    500,
    [typedText],
  );

  const handleSearch = (searchText: string) => {
    if (!searchText) {
      setFilteredOptions([]);
      return;
    }

    const SEARCH = searchText.trim().toUpperCase();

    const filtered = options.filter((option) =>
      String(option?.value ?? '')
        .toUpperCase()
        .includes(SEARCH),
    );

    const sorted = orderBy(filtered, [
      (option) => {
        const value = String(option?.value ?? '').toUpperCase();

        // Exact match
        if (value === SEARCH) return 0;

        // Full ID match within parentheses
        const idMatch = value.match(/\((.*?)\)/);
        if (idMatch && idMatch[1] === SEARCH) return 1;

        // Partial match at the beginning
        const index = value.indexOf(SEARCH);
        if (index === 0) return 2;

        // Partial match elsewhere
        if (index > 0) return 3;

        // No match
        return 4;
      },
    ]);

    setFilteredOptions(sorted);
  };

  const handlePressEnter = () => {
    if (filteredOptions.length > 0) {
      const ids = filteredOptions.map((opt) => namesDict[opt.value]).filter(Boolean);
      if (onFinishMultiple && ids.length > 0) {
        onFinishMultiple(ids); // Call the new prop with all matches
      } else if (namesDict[filteredOptions[0].value] !== undefined) {
        onFinish(namesDict[filteredOptions[0].value]); // Fallback to single onFinish
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
      allowClear={allowClear ?? true}
      filterOption={(inputValue, option) =>
        String(option?.value ?? '')
          .toUpperCase()
          .indexOf(inputValue?.toUpperCase()) !== -1
      }
      notFoundContent={typedText.length > 0 ? 'No items found' : 'Type to search...'}
      onSearch={setTypedText}
      onSelect={onSelect}
      options={filteredOptions}
      placeholder={placeholder ?? 'Search by name or id...'}
      style={{ width: 250, ...style }}
      {...rest}
    >
      <Input onPressEnter={handlePressEnter} />
    </AutoComplete>
  );
}
