import { Button, Checkbox, Divider, Flex, Popconfirm, Space, Switch, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize, cloneDeep, keyBy, orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useEffect, useMemo, useState } from 'react';
import type { SuspectCard } from 'types';
import { PopoverStrongAnswers } from './PopoverStrongAnswers';
import { calculateSuspectAnswersData } from './utils';

type TestimonyAnswerExpandedRowProps = {
  testimonyId: string;
  answers: TestimonyAnswers;
  suspects: Dictionary<SuspectCard>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
};

export function TestimonyAnswerExpandedRow({
  answers,
  suspects,
  addEntryToUpdate,
  testimonyId,
}: TestimonyAnswerExpandedRowProps) {
  const [cardWidth, ref] = useCardWidth(12);
  const { queryParams, addParam, removeParam, is } = useQueryParams({ sortSuspectsBy: 'answers' });
  const isBatchEnabled = is('enableBatch');
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'answers';

  const list = useMemo(() => {
    const res = Object.keys(suspects).map((suspectCardId) => {
      return calculateSuspectAnswersData(suspectCardId, answers);
    });

    if (sortSuspectsBy === 'answers') {
      return orderBy(
        res,
        ['reliable', 'enoughData', (o) => o.values.length, 'yesPercentage'],
        ['desc', 'desc', 'desc', 'desc'],
      );
    }

    return orderBy(res, (o) => Number(o.suspectCardId.split('-')[1]), ['asc']);
  }, [answers, suspects, sortSuspectsBy]);

  const [selection, setSelection] = useState<string[]>([]);

  return (
    <Space direction="vertical">
      <BatchOptions
        selection={selection}
        setSelection={setSelection}
        suspects={suspects}
        addEntryToUpdate={addEntryToUpdate}
        list={list}
        testimonyId={testimonyId}
        answers={answers}
      />
      <Space wrap ref={ref} size="large">
        {list.map((entry) => {
          return (
            <Flex key={entry.suspectCardId} vertical gap={6}>
              <ImageCard
                id={entry.imageId}
                width={cardWidth}
                className={entry.values.length > 1 ? undefined : 'grayscale'}
              />
              <Flex gap={4}>
                {isBatchEnabled && (
                  <Checkbox
                    disabled={entry.complete}
                    checked={selection.includes(entry.suspectCardId)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelection((prev) => {
                        if (checked) {
                          return [...prev, entry.suspectCardId];
                        }
                        return prev.filter((id) => id !== entry.suspectCardId);
                      });
                    }}
                  />
                )}
                <PopoverStrongAnswers
                  values={entry.values}
                  resolution={entry.resolution}
                  projection={entry.projection}
                  yesPercentage={entry.yesPercentage}
                  noPercentage={entry.noPercentage}
                  complete={entry.complete}
                  enoughData={entry.enoughData}
                  suspect={suspects[entry.suspectCardId]}
                  testimonyId={testimonyId}
                  answers={answers}
                  addEntryToUpdate={addEntryToUpdate}
                  barWidth={cardWidth}
                  showName
                />
              </Flex>
            </Flex>
          );
        })}
      </Space>
    </Space>
  );
}

type BatchOptionsProps = {
  testimonyId: string;
  selection: string[];
  setSelection: (selection: string[]) => void;
  suspects: Dictionary<SuspectCard>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
  list: ReturnType<typeof calculateSuspectAnswersData>[];
  answers: TestimonyAnswers;
};

function BatchOptions({
  testimonyId,
  selection,
  setSelection,
  suspects,
  addEntryToUpdate,
  list,
  answers,
}: BatchOptionsProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { addParam, removeParam, is } = useQueryParams({ sortSuspectsBy: 'answers' });
  const isBatchEnabled = is('enableBatch');

  const updateActiveFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter],
    );
  };

  const listDict = useMemo(() => {
    return keyBy(list, 'suspectCardId');
  }, [list]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (activeFilters.length === 0 && selection.length > 0) {
      setSelection([]);
      return;
    }
    if (!activeFilters.length) {
      return;
    }

    const source =
      selection.length > 0
        ? selection
        : Object.values(listDict)
            .filter((e) => {
              return !e.complete && !e.values.includes(3) && !e.values.includes(-3);
            })
            .map((e) => e.suspectCardId);

    // Run filters
    const filteredSelection = source.filter((suspectId) => {
      const suspect = suspects[suspectId];
      const searchString = [suspect.gender, suspect.ethnicity, suspect.build, suspect.height];
      if (suspect.age === '18-21') {
        searchString.push('young');
      }
      if (suspect.age === '60-70' || suspect.age === '70-80' || suspect.age === '80-90') {
        searchString.push('senior');
      }

      return activeFilters.every((filter) => searchString.includes(filter));
    });

    setSelection(filteredSelection);
  }, [activeFilters, selection, setSelection]);

  const onApplyBatch = (value: number) => {
    // Apply the batch update to the selected suspects
    const newAnswers = cloneDeep(answers);
    selection.forEach((suspectId) => {
      newAnswers[suspectId] = [...(newAnswers[suspectId] || []), value as 3 | -3];
    });
    addEntryToUpdate(testimonyId, newAnswers);
    setActiveFilters([]);
  };

  return (
    <Flex align="center" gap={6} wrap justify="space-between" className="mb-4">
      <Flex>
        <Typography.Text>Batch</Typography.Text>
        <Switch
          value={isBatchEnabled}
          checkedChildren="On"
          unCheckedChildren="Off"
          onChange={(checked) => {
            if (checked) {
              addParam('enableBatch', true);
            } else {
              removeParam('enableBatch');
            }
          }}
        />
      </Flex>
      {isBatchEnabled && (
        <>
          <Flex gap={6} wrap align="center">
            <FilterEntry
              filter="male"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="female"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="young"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="senior"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="thin"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="muscular"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="large"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="asian"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="black"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              filter="white"
              activeFilters={activeFilters}
              updateActiveFilter={updateActiveFilter}
            />

            <Button onClick={() => setActiveFilters([])} danger size="small">
              Clear
            </Button>
          </Flex>
          <Flex align="center" gap={6}>
            <Popconfirm title="Apply +3 to selected suspects?" onConfirm={() => onApplyBatch(3)}>
              <Button disabled={selection.length === 0} size="small" type="primary" className="ml-10">
                Apply +3
              </Button>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm title="Apply -3 to selected suspects?" onConfirm={() => onApplyBatch(-3)}>
              <Button disabled={selection.length === 0} size="small" type="primary">
                Apply -3
              </Button>
            </Popconfirm>
          </Flex>
        </>
      )}
    </Flex>
  );
}

type FilterEntryProps = {
  filter: string;
  activeFilters: string[];
  updateActiveFilter: (filter: string) => void;
};

function FilterEntry({ filter, activeFilters, updateActiveFilter }: FilterEntryProps) {
  return (
    <>
      <span>
        <Checkbox checked={activeFilters.includes(filter)} onClick={() => updateActiveFilter(filter)} />{' '}
        {capitalize(filter)}
      </span>
      <Divider type="vertical" />
    </>
  );
}
