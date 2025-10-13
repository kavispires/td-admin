import { Flex, Switch, Table, type TableProps, Typography } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
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

  const newq = Object.values(questions).map(({ id, question }) => ({ id, question }));

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
    // id, id (picture), name, answers, reliable answers

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
        return <SuspectImageCard cardId={id} width={48} />;
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
            <Typography.Text italic type="secondary">
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
        addEntryToUpdate={addEntryToUpdate}
        allAnswers={data}
        answersPerQuestion={record.answers}
        questions={questions}
        suspect={record}
      />
    ),
    rowExpandable: () => isSuccess,
  });

  return (
    <Flex className="full-width py-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          Testimonies by Suspect
        </Typography.Title>
        <DownloadButton data={newq} fileName={'newQuestions.json'} />
        <Switch
          checked={queryParams.get('sortSuspectsBy') === 'answers'}
          checkedChildren="Sort by Answers"
          onChange={(checked) => addParam('sortSuspectsBy', checked ? 'answers' : 'id')}
          unCheckedChildren="Sort by Id"
        />
      </Flex>
      <Table
        bordered
        className="full-width"
        columns={columns}
        dataSource={entries}
        expandable={expandableProps}
        loading={isLoading}
        pagination={paginationProps}
        rowKey="id"
      />
    </Flex>
  );
}
