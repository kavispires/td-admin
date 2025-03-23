import { Table, type TableProps } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import type { TestimonyAnswers, useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
import { SuspectAnswersExpandedRow } from './SuspectAnswersExpandedRow';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

export function SuspectAnswersTable({
  isLoading,
  isSuccess,
  questions,
  data,
  suspects,
}: TestimoniesContentProps) {
  const answersPerSuspect = useMemo(() => {
    return Object.keys(data).reduce((acc: Record<string, TestimonyAnswers>, questionId) => {
      const answers = data[questionId] ?? {};
      Object.keys(answers).forEach((imageId) => {
        const suspectId = `us-${imageId.split('-')[2]}`;
        if (!acc[suspectId]) {
          acc[suspectId] = {};
        }
        acc[suspectId][questionId] = answers[imageId];
      });

      return acc;
    }, {});
  }, [data]);

  const entries = useMemo(() => {
    return orderBy(Object.values(suspects), (entry) => Number(entry.id.split('-')[1]), 'asc');
  }, [suspects]);

  const paginationProps = useTablePagination({ total: entries.length, showQuickJumper: true });

  const columns: TableProps<SuspectCard>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]),
    },
    {
      title: 'Picture',
      dataIndex: 'id',
      render: (id) => {
        const imageId = id.split('-').join('-ct-');
        return <ImageCard id={imageId} width={48} />;
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.pt.localeCompare(b.name.pt),
      render: (name) => name.pt,
    },
    {
      title: 'Answers',
      dataIndex: 'id',
      key: 'answers',
      render: (id) => {
        const answers = answersPerSuspect[id];
        if (!answers) {
          return '';
        }
        return Object.values(answers).length;
      },
    },
  ];

  const expandableProps = useTableExpandableRows<SuspectCard>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <SuspectAnswersExpandedRow
        suspect={record}
        answersPerQuestion={answersPerSuspect[record.id]}
        questions={questions}
      />
    ),
    rowExpandable: () => isSuccess,
  });

  return (
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
  );
}
