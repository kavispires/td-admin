import { Flex, Input, Space, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { PopoverStrongAnswers } from './PopoverStrongAnswers';
import { calculateSuspectAnswersData } from './utils';

type SuspectAnswersExpandedRowProps = {
  suspect: SuspectCard;
  answersPerQuestion: TestimonyAnswers;
  questions: Dictionary<TestimonyQuestionCard>;
  addEntryToUpdate: (testimonyId: string, answers: TestimonyAnswers) => void;
  allAnswers: Dictionary<TestimonyAnswers>;
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
  resolution: string | null;
  projection: string | null;
  complete: boolean;
};

export function SuspectAnswersExpandedRow({
  suspect,
  answersPerQuestion = {},
  questions,
  addEntryToUpdate,
  allAnswers,
}: SuspectAnswersExpandedRowProps) {
  const { queryParams } = useQueryParams({ sortSuspectsBy: 'answers' });
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'answers';

  const list: RowType[] = useMemo(() => {
    const res = Object.values(questions).map((question) => {
      const answers = answersPerQuestion[question.id] ?? {};
      const {
        enoughData,
        reliable,
        yesPercentage,
        noPercentage,
        blankPercentage,
        values,
        total,
        resolution,
        projection,
        complete,
      } = calculateSuspectAnswersData(suspect.id, { [suspect.id]: answers });

      return {
        id: question.id,
        question,
        enoughData,
        reliable,
        yesPercentage,
        noPercentage,
        blankPercentage,
        values,
        total,
        resolution,
        projection,
        complete,
      };
    });

    if (sortSuspectsBy === 'answers') {
      return orderBy(
        res,
        ['reliable', 'enoughData', 'yesPercentage', (o) => o.values.length],
        ['desc', 'desc', 'desc', 'desc'],
      );
    }

    return orderBy(res, (o) => Number(o.id.split('-')[1]), ['asc']);
  }, [answersPerQuestion, questions, suspect.id, sortSuspectsBy]);

  const description = useMemo(() => {
    return writeDescription(suspect, list);
  }, [suspect, list]);

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
            <PopoverStrongAnswers
              values={entry.values}
              resolution={entry.resolution}
              projection={entry.projection}
              yesPercentage={entry.yesPercentage}
              noPercentage={entry.noPercentage}
              complete={entry.complete}
              enoughData={entry.enoughData}
              suspect={suspect}
              testimonyId={entry.question.id}
              answers={allAnswers[entry.question.id] || {}}
              addEntryToUpdate={addEntryToUpdate}
              barWidth={120}
            />
          </Flex>
        );
      },
    },
  ];

  return (
    <Space wrap size="large">
      <Table rowKey="id" columns={columns} dataSource={list} bordered />
      <Flex gap={8} vertical>
        <Typography.Title level={5}>Suspect Description</Typography.Title>

        <Input.TextArea value={description} readOnly className="full-width" rows={7} />
      </Flex>
    </Space>
  );
}

const writeDescription = (suspect: SuspectCard, list: RowType[]) => {
  const sentences = list
    .filter((entry) => entry.resolution || entry.projection)
    .map((entry) => {
      const { question, resolution, projection } = entry;
      const result = resolution || projection;
      const pronoun = suspect.gender === 'male' ? 'ele' : 'ela';
      return `${pronoun} ${result === '👍' ? '' : 'não '}${question.answer.toLocaleLowerCase()}`;
    });

  return `${suspect.name.pt}: ${sentences.join(', ')}`;
};
