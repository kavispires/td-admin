import { FireFilled, SearchOutlined } from '@ant-design/icons';
import { useQueryParams } from '@hooks/useQueryParams';
import type {
  TestimonyAnswers,
  TestimonyAnswersValues,
} from '@pages/Libraries/Testimonies/useTestimoniesResource';
import type { SuspectCardData, TestimonyQuestionCardData } from '@types';
import { Badge, Button, Flex, Input, Space, Switch, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { orderBy, shuffle } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PopoverStrongAnswers } from './PopoverStrongAnswers';
import { calculateSuspectAnswersData } from './utils';

type SuspectAnswersExpandedRowProps = {
  suspect: SuspectCardData;
  answersPerQuestion: TestimonyAnswers;
  questions: Dictionary<TestimonyQuestionCardData>;
  addEntryToUpdate: (testimonyId: string, answers: TestimonyAnswers) => void;
  allAnswers: Dictionary<TestimonyAnswers>;
};

type RowType = {
  id: string;
  question: TestimonyQuestionCardData;
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
  const { queryParams } = useQueryParams({ sortSuspectsBy: 'id' });
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'id';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHighValues, setFilterHighValues] = useState(false);

  const questionsList = useMemo(() => Object.values(questions).filter((q) => !q.deprecated), [questions]);

  // Store the shuffled order so it doesn't change on every re-render
  const shuffledOrderRef = useRef<string[]>([]);

  useEffect(() => {
    if (sortSuspectsBy === 'random') {
      const baseIds = questionsList.map((q) => q.id);
      shuffledOrderRef.current = shuffle(baseIds);
    }
  }, [sortSuspectsBy, questionsList]);

  const list: RowType[] = useMemo(() => {
    const res = questionsList.map((question) => {
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
      } = calculateSuspectAnswersData(suspect.id, question.id, { [suspect.id]: answers });

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

    if (sortSuspectsBy === 'level') {
      return orderBy(res, [(o) => o.question.level, (o) => Number(o.id.split('-')[1])], ['asc', 'asc']);
    }

    if (sortSuspectsBy === 'answers') {
      return orderBy(res, ['reliable', 'enoughData', 'yesPercentage'], ['desc', 'desc', 'desc']);
    }

    if (sortSuspectsBy === 'random') {
      const shuffledOrder = shuffledOrderRef.current;
      return res.sort((a, b) => shuffledOrder.indexOf(a.id) - shuffledOrder.indexOf(b.id));
    }

    return orderBy(res, (o) => Number(o.id.split('-')[1]), ['asc']);
  }, [answersPerQuestion, questionsList, suspect.id, sortSuspectsBy]);

  const description = useMemo(() => {
    return writeDescription(suspect, list);
  }, [suspect, list]);

  const columns: TableProps<RowType>['columns'] = [
    {
      key: 'id',
      title: 'Id',
      dataIndex: 'id',
      width: '7%',
    },
    {
      key: 'question',
      title: 'Question',
      dataIndex: 'question',
      render: (question) => (
        <Flex
          align="center"
          gap={6}
        >
          <span>{question.question}</span> <Tag>L{question.level}</Tag>{' '}
          {question.nsfw && <FireFilled style={{ color: 'hotPink' }} />}
          {question.deprecated && <Tag color="error">Deprecated</Tag>}
        </Flex>
      ),
    },
    {
      key: 'answer',
      title: 'Answer',
      dataIndex: 'id',
      width: '170px',
      sorter: (a, b) => a.total - b.total,
      render: (id) => {
        const entry = list.find((entry) => entry.id === id);
        if (!entry) {
          return '';
        }

        return (
          <Flex
            gap={8}
            wrap="nowrap"
          >
            <PopoverStrongAnswers
              addEntryToUpdate={addEntryToUpdate}
              answers={allAnswers[entry.question.id] || {}}
              barWidth={120}
              complete={entry.complete}
              enoughData={entry.enoughData}
              noPercentage={entry.noPercentage}
              projection={entry.projection}
              resolution={entry.resolution}
              suspect={suspect}
              testimonyId={entry.question.id}
              values={entry.values}
              yesPercentage={entry.yesPercentage}
            />
          </Flex>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      width: 'auto',
      render: (id) => {
        const entry = list.find((entry) => entry.id === id);
        if (!entry) {
          return '';
        }

        return (
          <ActionCell
            addEntryToUpdate={addEntryToUpdate}
            answers={allAnswers[entry.question.id] || {}}
            suspect={suspect}
            testimonyId={entry.question.id}
          />
        );
      },
    },
  ];

  const filteredList = useMemo(() => {
    let filtered = list;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply high values filter
    if (filterHighValues) {
      filtered = filtered.filter((item) => {
        const absoluteTotal = item.values.reduce((acc, val) => acc + Math.abs(val === 0 ? -1 : val), 0);
        return absoluteTotal <= 2;
      });
    }

    return filtered;
  }, [list, searchQuery, filterHighValues]);

  return (
    <Space
      size="large"
      wrap
    >
      <Flex
        className="full-width"
        gap={16}
        vertical
      >
        <Flex gap={6}>
          <Input
            allowClear
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16, width: 320 }}
            value={searchQuery}
          />
          <Flex
            align="center"
            gap={8}
          >
            <Switch
              checked={filterHighValues}
              onChange={setFilterHighValues}
            />
            <Typography.Text>Show only missing questions</Typography.Text>
          </Flex>
        </Flex>
        <Table
          bordered
          className="full-width"
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          tableLayout="fixed"
        />
      </Flex>
      <Flex
        gap={8}
        vertical
      >
        <Typography.Title level={5}>Suspect Description</Typography.Title>

        <Input.TextArea
          className="full-width"
          readOnly
          rows={7}
          value={description}
        />
      </Flex>
    </Space>
  );
}

const writeDescription = (suspect: SuspectCardData, list: RowType[]) => {
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

type ActionCellProps = {
  testimonyId: string;
  answers: TestimonyAnswers;
  addEntryToUpdate: (testimonyId: string, answers: TestimonyAnswers) => void;
  suspect: SuspectCardData;
};

export function ActionCell({ suspect, testimonyId, addEntryToUpdate, answers }: ActionCellProps) {
  const onAddValue = (suspectCardId: string, value: TestimonyAnswersValues) => {
    const newAnswers = { ...answers };
    newAnswers[suspectCardId] = [...(newAnswers[suspectCardId] || []), value];
    addEntryToUpdate(testimonyId, newAnswers);
  };

  const onRemoveValue = (suspectCardId: string, value: TestimonyAnswersValues) => {
    const newAnswers = { ...answers };
    // Find the index of the first occurrence of the value
    const index = newAnswers[suspectCardId]?.indexOf(value);
    // If found, remove only that occurrence
    if (index !== -1 && index !== undefined) {
      newAnswers[suspectCardId] = [
        ...newAnswers[suspectCardId].slice(0, index),
        ...newAnswers[suspectCardId].slice(index + 1),
      ];
    }
    addEntryToUpdate(testimonyId, newAnswers);
  };

  const total = useMemo(() => {
    // Calculate the total absolute sum of the values
    // If the value is a 0, count it as -1
    return Object.values(answers[suspect.id] || {}).reduce(
      (acc: number, curr) => acc + Math.abs(curr === 0 ? -1 : curr),
      0,
    );
  }, [answers, suspect.id]);

  return (
    <Flex
      align="center"
      gap={6}
      wrap="nowrap"
    >
      <Badge
        color={total > 20 ? 'gold' : 'grey'}
        count={total}
        showZero
        style={{ minWidth: 32 }}
      />
      <Space.Compact>
        <Button
          block
          icon="👍"
          onClick={() => onAddValue(suspect.id, 4)}
        >
          FIT
        </Button>
        <Button
          icon="❌"
          onClick={() => onRemoveValue(suspect.id, 4)}
        />
        <Button
          block
          icon="👎"
          onClick={() => onAddValue(suspect.id, -4)}
        >
          UNFIT
        </Button>
        <Button
          icon="❌"
          onClick={() => onRemoveValue(suspect.id, -4)}
        />

        <Button
          block
          icon="⬆️"
          onClick={() => onAddValue(suspect.id, 32)}
        >
          Sure
        </Button>
        <Button
          icon="✖️"
          onClick={() => onRemoveValue(suspect.id, 32)}
        />
        <Button
          block
          icon="⬇️"
          onClick={() => onAddValue(suspect.id, -32)}
        >
          Sure
        </Button>
        <Button
          icon="✖️"
          onClick={() => onRemoveValue(suspect.id, -32)}
        />
      </Space.Compact>
    </Flex>
  );
}
