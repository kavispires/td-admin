import { Flex, Progress, Space, Table, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd/lib';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { calculateSuspectAnswersData } from './utils';

type SuspectAnswersExpandedRowProps = {
  suspect: SuspectCard;
  answersPerQuestion: TestimonyAnswers;
  questions: Dictionary<TestimonyQuestionCard>;
};

type RowType = {
  id: string;
  question: TestimonyQuestionCard;
  enoughData: boolean;
  reliable: boolean;
  total: number;
  yesPercentage: number;
  noPercentage: number;
  blankPercentage: number;
  values: number[];
};

export function SuspectAnswersExpandedRow({
  suspect,
  answersPerQuestion,
  questions,
}: SuspectAnswersExpandedRowProps) {
  const list: RowType[] = useMemo(() => {
    return orderBy(
      Object.keys(answersPerQuestion).map((questionId) => {
        const question = questions[questionId];

        const { enoughData, reliable, yesPercentage, noPercentage, blankPercentage, values, total } =
          calculateSuspectAnswersData(suspect.id, { [suspect.id]: answersPerQuestion[questionId] });

        return {
          id: questionId,
          question,
          enoughData,
          reliable,
          yesPercentage,
          noPercentage,
          blankPercentage,
          values,
          total,
        };
      }),
      ['reliable', 'enoughData', 'yesPercentage', (o) => o.values.length],
      ['desc', 'desc', 'desc', 'desc'],
    );
  }, [answersPerQuestion, questions, suspect.id]);

  const columns: TableProps<RowType>['columns'] = [
    {
      key: 'id',
      title: 'Id',
      dataIndex: 'id',
    },
    {
      key: 'question',
      title: 'Question',
      dataIndex: 'question',
      render: (question) => question.question,
    },
    {
      key: 'answer',
      title: 'Answer',
      dataIndex: 'id',
      sorter: (a, b) => a.total - b.total,
      render: (id) => {
        const entry = list.find((entry) => entry.id === id);
        if (!entry) {
          return '';
        }

        return (
          <Flex gap={8} wrap="nowrap">
            <Tooltip title={`Values: ${entry.values.join(', ')}`}>
              <Progress
                percent={entry.noPercentage + entry.yesPercentage}
                size={entry.enoughData ? [100, 20] : [100, 10]}
                status={entry.enoughData ? 'exception' : 'active'}
                success={{ percent: entry.yesPercentage }}
                showInfo={false}
              />
            </Tooltip>
            {entry.yesPercentage >= entry.noPercentage ? (
              <Tag color="green-inverse">{entry.yesPercentage}% Yes</Tag>
            ) : (
              <Tag color="red-inverse">{entry.noPercentage}% No</Tag>
            )}
          </Flex>
        );
      },
    },
  ];

  return (
    <Space wrap size="large">
      <Table rowKey="id" columns={columns} dataSource={list} bordered />
    </Space>
  );
}
