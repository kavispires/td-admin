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
  const { isLoading, data } = useGetFirestoreDoc<DailyEntry>('diario', selectedDate, {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isLoading && data) {
      console.log(sortJsonKeys(data));
    }
  }, [data]);

  return (
    <div>
      <Typography.Title level={2}>Data Verification</Typography.Title>

      <Flex justify="space-between" align="center" className="mb-6">
        <Flex gap={12} align="center">
          <Space.Compact>
            <Input placeholder="YYYY-MM-DD" onChange={(e) => onUpdateDate(e.target.value)} />
            <Button type="primary" onClick={onValidateDate}>
              Load
            </Button>
          </Space.Compact>

          {selectedDate && (
            <Flex gap={6} align="center">
              <Button icon={<DoubleLeftOutlined />} onClick={onPreviousDate} />
              <span>
                <Tag>{selectedDate}</Tag>
              </span>
              <Button
                icon={<DoubleRightOutlined />}
                onClick={onNextDate}
                disabled={selectedDate === getToday()}
              />
            </Flex>
          )}

          <span>
            <Tag color={isLoading ? 'blue' : isValidDate ? 'green' : 'red'}>
              {isLoading ? 'Loading...' : isValidDate ? 'Valid' : 'Invalid'}
            </Tag>
          </span>

          <FirestoreConsoleLink path={`/diario/${selectedDate}`} disabled={!data} />
        </Flex>
      </Flex>
      <Table loading={isLoading} columns={dailyColumns} dataSource={rows} scroll={{ x: 'max-content' }} />
      <Divider />

      <Flex justify="space-between" align="center" className="mb-4" wrap>
        <CopyToClipboardButton
          content={JSON.stringify(rows[0], null, 2)}
          shape="default"
          className="mb-4"
          disabled={!data}
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
const findInObject = (obj: any, searchText: string): string[] => {
  if (!obj || !searchText || searchText.length < 2) return [];

  const results: string[] = [];
  const searchTextLower = searchText.toLowerCase();

  const search = (obj: any, path: string[] = []) => {
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
      const results = findInObject(data, text.trim());
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
    <Flex vertical gap={8}>
      <Input.Search
        placeholder="Search in data..."
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
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
