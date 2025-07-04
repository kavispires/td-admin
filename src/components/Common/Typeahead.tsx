import { AutoComplete, type AutoCompleteProps, Input } from 'antd';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

type TypeaheadProps<T> = Omit<AutoCompleteProps, 'options'> & {
  /**
   * The object data to be used for the typeahead.
   */
  data?: Dictionary<T>;
  /**
   * Indicates if the typeahead is currently pending data.
   */
  isPending?: boolean;
  /**
   * Callback function to be called when an item is selected or cleared.
   * @param id The ID of the selected item, or null if cleared.
   */
  onFinish: (id: string | null) => void;
  /**
   * The message displayed when the typeahead is empty or no results are found.
   */
  placeholder: string;
  /**
   * A function that takes the data and transforms is into the [searchString, id] format.
   */
  parser: (data: Dictionary<T>) => Dictionary<string>;
};

export function Typeahead<T>({
  data,
  isPending,
  onFinish,
  style,
  placeholder,
  parser,
  ...rest
}: TypeaheadProps<T>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Generates only when data or isPending changes
  const { dict, options } = useMemo(() => {
    console.log('Recomputing typeahead...');

    if (!data || isPending) {
      return { dict: {}, options: [] };
    }

    const searchDict = parser(data);

    const options = orderBy(Object.keys(searchDict), [(title) => title.toLowerCase()]).map((name) => ({
      value: name,
    }));

    return { dict: searchDict, options };
  }, [data, isPending]);

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
      const key = filteredOptions[0].value;
      if (dict[key] !== undefined) {
        onFinish(dict[key]);
      }
    }
  };

  const onSelect = (key: any) => {
    if (dict[key] !== undefined) {
      onFinish(dict[key]);
    }
  };

  return (
    <AutoComplete
      allowClear
      filterOption={(inputValue, option) =>
        String(option?.value ?? '')
          .toUpperCase()
          .indexOf(inputValue?.toUpperCase()) !== -1
      }
      notFoundContent={typedText.length > 0 ? 'No entries found' : 'Type to search...'}
      onSearch={setTypedText}
      onSelect={onSelect}
      options={filteredOptions}
      placeholder={placeholder}
      style={{ width: 250, ...style }}
      {...rest}
    >
      <Input onPressEnter={handlePressEnter} />
    </AutoComplete>
  );
}
