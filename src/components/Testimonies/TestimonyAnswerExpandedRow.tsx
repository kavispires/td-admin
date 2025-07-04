import { Button, Checkbox, Divider, Flex, Popconfirm, Space, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
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
  const { queryParams, is } = useQueryParams({ sortSuspectsBy: 'answers' });
  const isBatchEnabled = is('enableBatch');
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'answers';

  const list = useMemo(() => {
    const res = Object.keys(suspects).map((suspectCardId) => {
      return calculateSuspectAnswersData(suspectCardId, answers);
    });

    if (sortSuspectsBy === 'answers') {
      return orderBy(
        res,
        [
          'reliable',
          'enoughData',
          (o) => o.values.length,
          'yesPercentage',
          'noPercentage',
          (o) => Number(o.suspectCardId.split('-')[1]),
        ],
        ['desc', 'desc', 'desc', 'desc', 'desc', 'asc'],
      );
    }

    return orderBy(res, (o) => Number(o.suspectCardId.split('-')[1]), ['asc']);
  }, [answers, suspects, sortSuspectsBy]);

  const [selection, setSelection] = useState<string[]>([]);

  return (
    <Space direction="vertical">
      <BatchOptions
        addEntryToUpdate={addEntryToUpdate}
        answers={answers}
        list={list}
        selection={selection}
        setSelection={setSelection}
        suspects={suspects}
        testimonyId={testimonyId}
      />
      <Space ref={ref} size="large" wrap>
        {list.map((entry) => {
          return (
            <Flex
              className={clsx({
                'selection-outline': isBatchEnabled && selection.includes(entry.suspectCardId),
              })}
              gap={6}
              key={entry.suspectCardId}
              vertical
            >
              <SuspectImageCard
                className={entry.values.length > 1 ? undefined : 'grayscale'}
                id={entry.imageId}
                width={cardWidth}
              />
              <Flex gap={4}>
                {isBatchEnabled && (
                  <Checkbox
                    checked={selection.includes(entry.suspectCardId)}
                    disabled={entry.complete}
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
                  addEntryToUpdate={addEntryToUpdate}
                  answers={answers}
                  barWidth={cardWidth}
                  complete={entry.complete}
                  enoughData={entry.enoughData}
                  noPercentage={entry.noPercentage}
                  projection={entry.projection}
                  resolution={entry.resolution}
                  showName
                  suspect={suspects[entry.suspectCardId]}
                  testimonyId={testimonyId}
                  values={entry.values}
                  yesPercentage={entry.yesPercentage}
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
      if (suspect.age === '21-30' || suspect.age === '30-40') {
        searchString.push('adult');
      }
      if (suspect.age === '40-50') {
        searchString.push('parent');
      }
      if (
        suspect.age === '50-60' ||
        suspect.age === '60-70' ||
        suspect.age === '70-80' ||
        suspect.age === '80-90'
      ) {
        searchString.push('senior');
      }

      return activeFilters.every((filter) => searchString.includes(filter));
    });

    setSelection(filteredSelection);
  }, [activeFilters]);

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
    <Flex align="center" className="mb-4" gap={6} justify="space-between">
      <Flex gap={3}>
        <Typography.Text className="nowrap" style={{ minWidth: '5ch' }}>
          Batch
        </Typography.Text>
        <Switch
          checkedChildren="On"
          onChange={(checked) => {
            if (checked) {
              addParam('enableBatch', true);
            } else {
              removeParam('enableBatch');
            }
          }}
          unCheckedChildren="Off"
          value={isBatchEnabled}
        />
      </Flex>
      {isBatchEnabled && (
        <>
          <Typography.Text className="nowrap mr-2">Selected {selection.length}</Typography.Text>
          <Flex align="center" gap={6} justify="center" wrap>
            <FilterEntry
              activeFilters={activeFilters}
              filter="male"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="female"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="young"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="adult"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="parent"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="senior"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="thin"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="muscular"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="large"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="asian"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="black"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="caucasian"
              updateActiveFilter={updateActiveFilter}
            />
            <FilterEntry
              activeFilters={activeFilters}
              filter="latino"
              updateActiveFilter={updateActiveFilter}
            />
          </Flex>
          <Flex align="center" gap={6}>
            <Button danger onClick={() => setActiveFilters([])} size="small">
              Clear
            </Button>
            <Popconfirm onConfirm={() => onApplyBatch(3)} title="Apply +3 to selected suspects?">
              <Button className="ml-10" disabled={selection.length === 0} size="small" type="primary">
                Apply +3
              </Button>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm onConfirm={() => onApplyBatch(-3)} title="Apply -3 to selected suspects?">
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
