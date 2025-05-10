import { Flex, Progress, Space, Table, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd/lib';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';

type SuspectAnswersExpandedRowProps = {
  suspect: SuspectCard;
  answersPerQuestion: TestimonyAnswers;
  questions: Dictionary<TestimonyQuestionCard>;
};

type RowType = {
  id: string;
  question: TestimonyQuestionCard;
  enoughData: boolean;
  reliability: number;
  yesPercentage: number;
  noPercentage: number;
  blankPercentage: number;
  values: number[];
};

export function SuspectAnswersExpandedRow({ answersPerQuestion, questions }: SuspectAnswersExpandedRowProps) {
  const list: RowType[] = useMemo(() => {
    return orderBy(
      Object.keys(answersPerQuestion).map((questionId) => {
        const question = questions[questionId];
        const values = answersPerQuestion[questionId];
        const enoughData = values.length > 2;
        const reliability = values.length;
        const total = Math.max(values.length, 5);
        const yesCount = values.filter((v) => v === 1).length;
        const yesPercentage = Math.round((yesCount / total) * 100);
        const noCount = values.filter((v) => v === 0).length;
        const noPercentage = Math.round((noCount / total) * 100);
        const blankPercentage = Math.round(((total - yesCount - noCount) / total) * 100);

        return {
          id: questionId,
          question,
          enoughData,
          reliability,
          yesPercentage,
          noPercentage,
          blankPercentage,
          values,
        };
      }),
      ['reliability', 'enoughData', 'yesPercentage'],
      ['desc', 'desc', 'desc'],
    );
  }, [answersPerQuestion, questions]);

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
      sorter: (a, b) => a.reliability - b.reliability,
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
