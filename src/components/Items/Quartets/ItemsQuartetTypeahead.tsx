import { AutoComplete, type AutoCompleteProps, Input } from 'antd';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import type { DailyQuartetSet } from 'types';

type ItemsQuartetTypeaheadProps = {
  quartets?: Dictionary<DailyQuartetSet>;
  isPending?: boolean;
  onFinish: (id: string | null) => void;
} & Omit<AutoCompleteProps, 'options'>;

export function ItemsQuartetTypeahead({
  quartets,
  isPending,
  onFinish,
  style,
  ...rest
}: ItemsQuartetTypeaheadProps) {
  const { titlesDict, options } = useMemo(() => {
    console.log('Recomputing quartets tiles typeahead...');

    const titlesDict = Object.values(quartets ?? {}).reduce((acc: Record<string, string>, quartet) => {
      acc[quartet.title] = quartet.id;
      return acc;
    }, {});

    const options = orderBy(Object.keys(titlesDict), [(title) => title.toLowerCase()]).map((name) => ({
      value: name,
    }));

    return { titlesDict, options };
  }, [quartets, isPending]);

  const [filteredOptions, setFilteredOptions] = useState<{ value: string }[]>([]);
  const [typedText, setTypedText] = useState('');

  useDebounce(
    () => {
      if (typedText) {
        handleSearch(typedText);
      } else {
        onFinish(null);
      }
    },
    350,
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
      const key = filteredOptions[0].value;
      if (titlesDict[key] !== undefined) {
        onFinish(titlesDict[key]);
      }
    }
  };

  const onSelect = (key: any) => {
    if (titlesDict[key] !== undefined) {
      onFinish(titlesDict[key]);
    }
  };

  return (
    <AutoComplete
      options={filteredOptions}
      style={{ width: 250, ...style }}
      allowClear
      placeholder={'Search quartet by title...'}
      filterOption={(inputValue, option) =>
        String(option?.value ?? '')
          .toUpperCase()
          .indexOf(inputValue?.toUpperCase()) !== -1
      }
      onSearch={setTypedText}
      notFoundContent={typedText.length > 0 ? 'No quartets found' : 'Type to search...'}
      onSelect={onSelect}
      {...rest}
    >
      <Input onPressEnter={handlePressEnter} />
    </AutoComplete>
  );
}
