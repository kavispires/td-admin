import { FireFilled, SearchOutlined } from '@ant-design/icons';
import { Flex, Input, Switch, Table, type TableProps, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import type { useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
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
      title: 'Answers',
      dataIndex: 'answersCount',
      key: 'answersCount',
      sorter: (a, b) => a.answersCount - b.answersCount,
    },
  ];

  const expandableProps = useTableExpandableRows<RowData>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <TestimonyAnswerExpandedRow
        addEntryToUpdate={addEntryToUpdate}
        answers={data[record.id] ?? {}}
        key={record.id}
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
      <Input
        allowClear
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search questions by text or ID..."
        prefix={<SearchOutlined />}
        style={{ width: 320 }}
        value={searchQuery}
      />
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
