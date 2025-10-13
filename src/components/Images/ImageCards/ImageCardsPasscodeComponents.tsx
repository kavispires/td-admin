import { AutoComplete, Button, Flex, Input, Select, Table, type TableProps } from 'antd';
import { IdTag } from 'components/Common/IdTag';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import type { ImageCardPasscodeSet } from 'types';
import { ImageCard } from '../ImageCard';

type ImageCardsPasscodeProps = UseResourceFirestoreDataReturnType<ImageCardPasscodeSet>;

type SetsTableProps = {
  sets: ImageCardPasscodeSet[];
  addEntryToUpdate: (id: string, entry: ImageCardPasscodeSet) => void;
  hidePagination?: boolean;
};

export function SetsTable({ sets, addEntryToUpdate, hidePagination }: SetsTableProps) {
  const paginationProps = useTablePagination({ total: sets.length, showQuickJumper: true });

  const columns: TableProps<ImageCardPasscodeSet>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Passcode',
      dataIndex: 'passcode',
      key: 'passcode',
      sorter: (a, b) => a.passcode[0].localeCompare(b.passcode[0]),
      render: (_, record) => <EditablePasscodeEntries addEntryToUpdate={addEntryToUpdate} entry={record} />,
    },

    {
      title: 'Cards',
      dataIndex: 'imageCardsIds',
      key: 'imageCardsIds',
      render: (_, record) => <EditableImageCardsEntries addEntryToUpdate={addEntryToUpdate} entry={record} />,
    },
  ];

  return (
    <Table
      className="my-4"
      columns={columns}
      dataSource={sets}
      pagination={hidePagination ? undefined : paginationProps}
      rowKey="id"
    />
  );
}

type EditablePasscodeEntriesProps = {
  entry: ImageCardPasscodeSet;
  addEntryToUpdate: ImageCardsPasscodeProps['addEntryToUpdate'];
};
export function EditablePasscodeEntries({ entry, addEntryToUpdate }: EditablePasscodeEntriesProps) {
  const onUpdateName = (value: any) => {
    addEntryToUpdate(entry.id, { ...entry, passcode: value });
  };

  return (
    <Select
      defaultValue={entry.passcode}
      mode="tags"
      onChange={onUpdateName}
      placeholder="Add passcode from easier to harder"
      style={{ width: 300 }}
    />
  );
}

type EditableImageCardsEntriesProps = {
  entry: ImageCardPasscodeSet;
  addEntryToUpdate: ImageCardsPasscodeProps['addEntryToUpdate'];
};

export function EditableImageCardsEntries({ entry, addEntryToUpdate }: EditableImageCardsEntriesProps) {
  const [newId, setNewId] = useState('');

  const onAddImageCard = () => {
    if (!newId) return;
    addEntryToUpdate(entry.id, { ...entry, imageCardsIds: [...entry.imageCardsIds, newId.trim()] });
    setNewId('');
  };

  const onRemoveImageCard = (id: string) => {
    addEntryToUpdate(entry.id, { ...entry, imageCardsIds: entry.imageCardsIds.filter((i) => i !== id) });
  };

  return (
    <Flex align="flex-end" gap={6} wrap="wrap">
      {entry.imageCardsIds.map((id) => (
        <Flex gap={2} key={id} vertical>
          <ImageCard cardId={id} width={60} />
          <IdTag>{id}</IdTag>
          <Button onClick={() => onRemoveImageCard(id)} size="small">
            Remove
          </Button>
        </Flex>
      ))}
      <div>
        <Input
          onChange={(e) => setNewId(e.target.value)}
          onPressEnter={onAddImageCard}
          placeholder="td-d*"
          style={{ width: 100 }}
          value={newId}
        />
      </div>
    </Flex>
  );
}

export function usePasscodeSetTypeahead(data: Dictionary<ImageCardPasscodeSet>, withIds = false) {
  return useMemo(() => {
    console.log('Recomputing passcode names typeahead...');
    const imagesDict: Record<string, string[]> = {};
    const namesDict = Object.values(data).reduce((acc: Dictionary<string>, entry) => {
      entry.passcode.forEach((passcode) => {
        const key = withIds ? `${passcode} (${entry.id})` : passcode;
        if (acc[key]) {
          console.warn(`Duplicate passcode found: ${passcode}`, acc[key], entry.id);
        }
        acc[key] = entry.id;

        // Count image cards
        entry.imageCardsIds.forEach((imageId) => {
          if (!imagesDict[imageId]) {
            imagesDict[imageId] = [];
          }
          imagesDict[imageId].push(passcode);
        });
      });

      return acc;
    }, {});

    const options = orderBy(Object.keys(namesDict), [(name) => name.toLowerCase()]).map((name) => ({
      value: name,
    }));

    return { namesDict, options, imagesDict };
  }, [data, withIds]);
}

type PasscodeSearchProps = {
  data: Dictionary<ImageCardPasscodeSet>;
  onFinish: (id: string) => void;
};

export function PasscodeSearch({ data, onFinish }: PasscodeSearchProps) {
  const { namesDict, options } = usePasscodeSetTypeahead(data, true);

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
      if (namesDict[filteredOptions[0].value] !== undefined) {
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
      allowClear={true}
      filterOption={(inputValue, option) =>
        String(option?.value ?? '')
          .toUpperCase()
          .indexOf(inputValue?.toUpperCase()) !== -1
      }
      notFoundContent={typedText.length > 0 ? 'No items found' : 'Type to search...'}
      onSearch={setTypedText}
      onSelect={onSelect}
      options={filteredOptions}
      placeholder={'Search...'}
      style={{ width: 250 }}
    >
      <Input onPressEnter={handlePressEnter} />
    </AutoComplete>
  );
}
