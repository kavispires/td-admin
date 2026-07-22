import { CloudSyncOutlined, SearchOutlined } from '@ant-design/icons';
import { DownloadButton } from '@components/Common/DownloadButton';
import { PageContent } from '@components/Common/PageContent';
import { SuspectImageCard } from '@components/Suspects/SuspectImageCard';
import { useQueryParams } from '@hooks/useQueryParams';
import { useTableExpandableRows } from '@hooks/useTableExpandableRows';
import { useTablePagination } from '@hooks/useTablePagination';
import type {
  TestimonyAnswers,
  useTestimoniesResource,
} from '@pages/Libraries/Testimonies/useTestimoniesResource';
import type { SuspectCardData } from '@types';
import { Button, Flex, Input, Segmented, Table, type TableProps, Tooltip, Typography } from 'antd';
import { orderBy, sample } from 'lodash';
import { useMemo, useState } from 'react';
import { SuspectAnswersExpandedRow } from './SuspectAnswersExpandedRow';
import { filterAdultSuspects } from './utils';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

type SuspectRow = SuspectCardData & {
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter to only include adult suspects in testimonies
  const onlyAdults = useMemo(() => filterAdultSuspects(suspects), [suspects]);

  const entries: SuspectRow[] = useMemo(() => {
    // id, id (picture), name, answers, reliable answers

    const ordered = orderBy(
      Object.values(onlyAdults).map((s) => ({ ...s, answers: answersPerSuspect[s.id] })),
      (entry) => Number(entry.id.split('-')[1]),
      'asc',
    );

    if (!searchQuery.trim()) {
      return ordered;
    }

    return ordered.filter(
      (item) =>
        item.name.pt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [onlyAdults, answersPerSuspect, searchQuery]);

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
        return (
          <SuspectImageCard
            cardId={id}
            cardWidth={48}
          />
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.pt.localeCompare(b.name.pt),
      render: (names) => {
        return (
          <Flex vertical>
            <Typography.Text>{names.pt}</Typography.Text>
            <Typography.Text type="secondary">{names.en}</Typography.Text>
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
    <PageContent>
      <Flex
        align="center"
        justify="space-between"
      >
        <Flex gap={8}>
          <Typography.Title
            className="my-0"
            level={4}
          >
            Testimonies by Suspect
          </Typography.Title>
          <DownloadButton
            data={() => Object.values(questions).map(({ id, question }) => ({ id, question }))}
            fileName={'newQuestions.json'}
          />
        </Flex>
        <Flex
          align="center"
          gap={3}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Sort by:</span>
          <Segmented
            onChange={(value) => addParam('sortSuspectsBy', value)}
            options={[
              { label: 'IDs', value: 'id' },
              { label: 'Answers', value: 'answers' },
              { label: 'Level', value: 'level' },
            ]}
            value={queryParams.get('sortSuspectsBy') ?? 'id'}
          />
        </Flex>
      </Flex>
      <Flex gap={6}>
        <Input
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search suspects by name or ID..."
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          value={searchQuery}
        />
        <Tooltip title="Select random suspect">
          <Button
            icon={<CloudSyncOutlined />}
            onClick={() => setSearchQuery(sample(Object.keys(onlyAdults)) ?? '')}
          />
        </Tooltip>
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
    </PageContent>
  );
}
