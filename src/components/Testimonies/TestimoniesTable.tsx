import { FireFilled } from '@ant-design/icons';
import { Space, Table, type TableProps } from 'antd';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import type { useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { TestimonyQuestionCard } from 'types';
import { TestimonyAnswerExpandedRow } from './TestimonyAnswerExpandedRow';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesTable({
  data,
  questions,
  suspects,
  isLoading,
  isSuccess,
}: TestimoniesContentProps) {
  const entries = useMemo(() => {
    return orderBy(Object.values(questions), (entry) => Number(entry.id.split('-')[1]), 'asc');
  }, [questions]);

  const paginationProps = useTablePagination({ total: entries.length, showQuickJumper: true });

  const columns: TableProps<TestimonyQuestionCard>['columns'] = [
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
      dataIndex: 'id',
      key: 'answers',
      render: (id) => {
        const answers = data[id];
        if (!answers) {
          return '';
        }
        return Object.values(answers).length;
      },
    },
  ];

  const expandableProps = useTableExpandableRows<TestimonyQuestionCard>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <TestimonyAnswerExpandedRow answers={data[record.id] ?? {}} suspects={suspects} />
    ),
    rowExpandable: () => isSuccess,
  });

  return (
    <Space direction="vertical">
      <Table
        columns={columns}
        dataSource={entries}
        pagination={paginationProps}
        rowKey="id"
        expandable={expandableProps}
        loading={isLoading}
        bordered
        className="full-width"
      />
    </Space>
  );
}
