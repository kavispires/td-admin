import { CloudSyncOutlined, FireFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Switch, Table, type TableProps, Tooltip, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy, sample } from 'lodash';
import type { useTestimoniesResource } from 'pages/Libraries/Testimonies/useTestimoniesResource';
import { useMemo, useState } from 'react';
import type { TestimonyQuestionCard } from 'types';
import { TestimonyAnswerExpandedRow } from './TestimonyAnswerExpandedRow';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

type RowData = TestimonyQuestionCard & { answersCount: number };

export function TestimoniesTable({
  data,
  questions,
  suspects,
  isLoading,
  isSuccess,
  addEntryToUpdate,
}: TestimoniesContentProps) {
  const { queryParams, addParam } = useQueryParams();
  const [searchQuery, setSearchQuery] = useState('');

  // biome-ignore lint/correctness/useExhaustiveDependencies: don't recalculate unless questions change
  const entriesRowData = useMemo(() => {
    return orderBy(
      Object.values(questions).map((entry) => ({
        ...entry,
        answersCount: Object.values(data[entry.id] ?? {}).length,
      })),
      (entry) => Number(entry.id.split('-')[1]),
      'asc',
    );
  }, [questions]);

  const filteredRowData = useMemo(() => {
    if (!searchQuery.trim()) {
      return entriesRowData;
    }
    return entriesRowData.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [entriesRowData, searchQuery]);

  const paginationProps = useTablePagination({ total: filteredRowData.length, showQuickJumper: true });

  const columns: TableProps<RowData>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]),
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      sorter: (a, b) => a.question.localeCompare(b.question),
    },
    {
      title: 'NSFW',
      dataIndex: 'nsfw',
      key: 'nsfw',
      render: (nsfw) => (nsfw ? <FireFilled style={{ color: 'hotPink' }} /> : ''),
      sorter: (a, b) => Number(a.nsfw) - Number(b.nsfw),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: (a, b) => (a?.level ?? 0) - (b?.level ?? 0),
    },
    {
      title: 'Answers',
      dataIndex: 'answersCount',
      key: 'answersCount',
      sorter: (a, b) => a.answersCount - b.answersCount,
    },
    {
      title: 'Info',
      dataIndex: 'alignment',
      key: 'alignment',
      render: (_, record) => {
        const mbti = record.mbti ? record.mbti.related.join(', ') : 'N/A';
        const zodiac = record.zodiac ? record.zodiac.related.join(', ') : 'N/A';
        const alignment = record.alignment ? record.alignment.related.join(', ') : 'N/A';
        return (
          <Typography.Paragraph style={{ fontSize: '0.85em', marginBottom: 0 }}>
            <div>
              <strong>MBTI:</strong> {mbti}
            </div>
            <div>
              <strong>Zodiac:</strong> {zodiac}
            </div>
            <div>
              <strong>Alignment:</strong> {alignment}
            </div>
          </Typography.Paragraph>
        );
      },
    },
  ];

  const expandableProps = useTableExpandableRows<RowData>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <TestimonyAnswerExpandedRow
        addEntryToUpdate={addEntryToUpdate}
        answers={data[record.id] ?? {}}
        key={record.id}
        question={record.question}
        suspects={suspects}
        testimonyId={record.id}
      />
    ),
    rowExpandable: () => isSuccess,
  });

  return (
    <Flex className="full-width py-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          Suspects by Testimony
        </Typography.Title>
        <Switch
          checked={queryParams.get('sortSuspectsBy') === 'answers'}
          checkedChildren="Sort by Answers"
          onChange={(checked) => addParam('sortSuspectsBy', checked ? 'answers' : 'id')}
          unCheckedChildren="Sort by Id"
        />
      </Flex>
      <Flex gap={6}>
        <Input
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by text or ID..."
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          value={searchQuery}
        />
        <Tooltip title="Set random question">
          <Button
            icon={<CloudSyncOutlined />}
            onClick={() => setSearchQuery(sample(Object.keys(questions)) ?? '')}
          />
        </Tooltip>
      </Flex>
      <Table
        bordered
        className="full-width"
        columns={columns}
        dataSource={filteredRowData}
        expandable={expandableProps}
        loading={isLoading}
        pagination={paginationProps}
        rowKey="id"
      />
    </Flex>
  );
}
