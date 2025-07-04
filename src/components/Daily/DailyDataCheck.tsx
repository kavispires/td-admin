import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import ReactJsonView from '@microlink/react-json-view';
import { Button, Divider, Flex, Input, Space, Table, Tag, Typography } from 'antd';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useGetFirestoreDoc } from 'hooks/useGetFirestoreDoc';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { sortJsonKeys } from 'utils';
import { dailyColumns } from './DailyColumns';
import type { DailyEntry } from './hooks';
import { getToday } from './utils/utils';

export function DailyDataCheck() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isValidDate, setIsValidDate] = useState(false);
  const { isLoading, data, dataUpdatedAt } = useGetFirestoreDoc<DailyEntry>('diario', selectedDate, {
    enabled: !!selectedDate && isValidDate,
  });

  const rows = useMemo(() => {
    return data ? [sortJsonKeys(data, ['number'])] : [];
  }, [data]);

  const onUpdateDate = (value: string) => {
    setIsValidDate(false);
    setSelectedDate(value.trim());
  };

  const onValidateDate = () => {
    setIsValidDate(moment(selectedDate, 'YYYY-MM-DD', true).isValid());
  };

  const onPreviousDate = () => {
    const previousDate = moment(selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
    setSelectedDate(previousDate);
  };

  const onNextDate = () => {
    const nextDate = moment(selectedDate).add(1, 'days').format('YYYY-MM-DD');
    setSelectedDate(nextDate);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only important when data is updated
  useEffect(() => {
    if (!isLoading && data) {
      console.log(sortJsonKeys(data));
    }
  }, [dataUpdatedAt]);

  return (
    <div>
      <Typography.Title level={2}>Data Verification</Typography.Title>

      <Flex align="center" className="mb-6" justify="space-between">
        <Flex align="center" gap={12}>
          <Space.Compact>
            <Input onChange={(e) => onUpdateDate(e.target.value)} placeholder="YYYY-MM-DD" />
            <Button onClick={onValidateDate} type="primary">
              Load
            </Button>
          </Space.Compact>

          {selectedDate && (
            <Flex align="center" gap={6}>
              <Button icon={<DoubleLeftOutlined />} onClick={onPreviousDate} />
              <span>
                <Tag>{selectedDate}</Tag>
              </span>
              <Button
                disabled={selectedDate === getToday()}
                icon={<DoubleRightOutlined />}
                onClick={onNextDate}
              />
            </Flex>
          )}

          <span>
            <Tag color={isLoading ? 'blue' : isValidDate ? 'green' : 'red'}>
              {isLoading ? 'Loading...' : isValidDate ? 'Valid' : 'Invalid'}
            </Tag>
          </span>

          <FirestoreConsoleLink disabled={!data} path={`/diario/${selectedDate}`} />
        </Flex>
      </Flex>
      <Table columns={dailyColumns} dataSource={rows} loading={isLoading} scroll={{ x: 'max-content' }} />
      <Divider />

      <Flex align="center" className="mb-4" justify="space-between" wrap>
        <CopyToClipboardButton
          className="mb-4"
          content={JSON.stringify(rows[0], null, 2)}
          disabled={!data}
          shape="default"
        >
          Copy to Clipboard
        </CopyToClipboardButton>

        <DataSearcher data={data} />
      </Flex>

      <ReactJsonView src={rows[0] ?? {}} theme="twilight" />
    </div>
  );
}

// Helper function to search deeply through objects
const findInObject = <T extends Record<string, any>>(obj: T, searchText: string): string[] => {
  if (!obj || !searchText || searchText.length < 2) return [];

  const results: string[] = [];
  const searchTextLower = searchText.toLowerCase();

  const search = (obj: T, path: string[] = []) => {
    if (!obj) return;

    if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        // Check if key contains the search text
        if (key.toLowerCase().includes(searchTextLower)) {
          results.push([...path, key].join('.'));
        }

        // Check if value is a string and contains the search text
        if (typeof value === 'string' && value.toLowerCase().includes(searchTextLower)) {
          results.push([...path, key].join('.'));
        }

        // Recursively search in objects and arrays
        if (typeof value === 'object' && value !== null) {
          search(value, [...path, key]);
        }
      });
    }
  };

  search(obj);
  return results;
};

type DataSearcherProps = {
  data?: DailyEntry;
};

function DataSearcher({ data }: DataSearcherProps) {
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (text: string) => {
    setCurrentSearchText(text);
    if (text.trim().length > 1) {
      const results = findInObject(data ?? {}, text.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Keep track of the current search input
  const [currentSearchText, setCurrentSearchText] = useState('');

  // Update the search when the date or data changes but only if there was an active search
  // biome-ignore lint/correctness/useExhaustiveDependencies: only needs to run when data changes
  useEffect(() => {
    if (data && currentSearchText.trim().length > 1) {
      const results = findInObject(data, currentSearchText.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [data]);

  return (
    <Flex gap={8} vertical>
      <Input.Search
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        placeholder="Search in data..."
        style={{ width: 250 }}
      />
      {searchResults.length > 0 && (
        <div>
          <Typography.Text>Found {searchResults.length} matches:</Typography.Text>
          <ul style={{ maxHeight: '200px', overflow: 'auto', margin: '4px 0' }}>
            {searchResults.map((result, index) => (
              <li key={index}>
                <Typography.Text code copyable>
                  {result}
                </Typography.Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Flex>
  );
}
