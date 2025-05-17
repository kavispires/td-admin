import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Table, Tag, Typography } from 'antd';
import { useGetFirebaseDoc } from 'hooks/useGetFirebaseDoc';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { sortJsonKeys } from 'utils';
import { dailyColumns } from './DailyColumns';
import type { DailyEntry } from './hooks';
import { getToday } from './utils/utils';

export function DailyDataCheck() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isValidDate, setIsValidDate] = useState(false);
  const { isLoading, data } = useGetFirebaseDoc<DailyEntry>('diario', selectedDate, {
    enabled: !!selectedDate && isValidDate,
  });

  const rows = useMemo(() => {
    return data ? [data] : [];
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
        </Flex>
      </Flex>
      <Table loading={isLoading} columns={dailyColumns} dataSource={rows} scroll={{ x: 'max-content' }} />
    </div>
  );
}
