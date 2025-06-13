import { Flex, Switch, Table, type TableProps, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { getSuspectImageId } from 'components/Suspects/utils';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import type { TestimonyAnswers, useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
import { SuspectAnswersExpandedRow } from './SuspectAnswersExpandedRow';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

type SuspectRow = SuspectCard & {
  answers: TestimonyAnswers;
};

export function SuspectAnswersTable({
  isLoading,
  isSuccess,
  questions,
  data,
  suspects,
  addEntryToUpdate,
}: TestimoniesContentProps) {
  const { queryParams, addParam } = useQueryParams();

  const answersPerSuspect = useMemo(() => {
    return Object.keys(data).reduce((acc: Record<string, TestimonyAnswers>, questionId) => {
      const answers = data[questionId] ?? {};
      Object.keys(answers).forEach((id) => {
        if (!acc[id]) {
          acc[id] = {};
        }
        acc[id][questionId] = answers[id];
      });

      return acc;
    }, {});
  }, [data]);

  const entries: SuspectRow[] = useMemo(() => {
    return orderBy(
      Object.values(suspects).map((s) => ({ ...s, answers: answersPerSuspect[s.id] })),
      (entry) => Number(entry.id.split('-')[1]),
      'asc',
    );
  }, [suspects, answersPerSuspect]);

  const paginationProps = useTablePagination({ total: entries.length, showQuickJumper: true });

  const columns: TableProps<SuspectRow>['columns'] = [
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
        return <ImageCard id={getSuspectImageId(id, 'gb')} width={48} />;
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.pt.localeCompare(b.name.pt),
      render: (names, record) => {
        return (
          <Flex vertical>
            <Typography.Text>{names.pt}</Typography.Text>
            <Typography.Text type="secondary">{names.en}</Typography.Text>
            <Typography.Text type="secondary" italic>
              <small>{record.note}</small>
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: 'Questions Answered',
      dataIndex: 'answers',
      key: 'answers',
      sorter: (a, b) => Object.keys(a.answers ?? {}).length - Object.keys(b.answers ?? {}).length,
      render: (answers) => {
        if (!answers) {
          return '';
        }
        return Object.values(answers).length;
      },
    },
  ];

  const expandableProps = useTableExpandableRows<SuspectRow>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <SuspectAnswersExpandedRow
        suspect={record}
        answersPerQuestion={answersPerSuspect[record.id]}
        questions={questions}
        addEntryToUpdate={addEntryToUpdate}
        allAnswers={data}
      />
    ),
    rowExpandable: () => isSuccess,
  });

  return (
    <Flex gap={12} className="full-width py-4" vertical>
      <Flex justify="space-between" align="center">
        <Typography.Title level={4} className="my-0">
          Testimonies by Suspect
        </Typography.Title>
        <Switch
          checked={queryParams.get('sortSuspectsBy') === 'answers'}
          onChange={(checked) => addParam('sortSuspectsBy', checked ? 'answers' : 'id')}
          checkedChildren="Sort by Answers"
          unCheckedChildren="Sort by Id"
        />
      </Flex>
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
    </Flex>
  );
}
