import { Button, Flex, Input, Space, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useGetFirebaseDoc } from 'hooks/useGetFirebaseDoc';
import { useMemo, useState } from 'react';
import type { DailyEntry } from './hooks';
import moment from 'moment';
import { dailyColumns } from './DailyColumns';

export function DataDailyCheck() {
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
    console.log(selectedDate, moment(selectedDate, 'YYYY-MM-DD', true).isValid());
    setIsValidDate(moment(selectedDate, 'YYYY-MM-DD', true).isValid());
  };
  console.log(data);

  return (
    <div>
      <Typography.Title level={2}>Data Verification</Typography.Title>

      <Link to="/game/daily-setup">Go to Setup</Link>
      <Flex justify="space-between" align="center" className="mb-2">
        <Space.Compact>
          <Input placeholder="YYYY-MM-DD" onChange={(e) => onUpdateDate(e.target.value)} />
          <Button type="primary" onClick={onValidateDate}>
            Load
          </Button>
        </Space.Compact>
        {selectedDate} {isValidDate ? 'Valid' : 'Invalid'}
        <Button
          // // onClick={() => save(dataLoad.entries)}
          // loading={isPending}
          // disabled={(dataLoad.entries ?? []).length === 0}
          disabled
          type="primary"
          size="large"
        >
          Save
        </Button>
      </Flex>
      <Table loading={isLoading} columns={dailyColumns} dataSource={rows} scroll={{ x: 'max-content' }} />
    </div>
  );
}
