import { ExpandOutlined } from '@ant-design/icons';
import { Button, Checkbox, Divider, Flex, FloatButton, Popconfirm, Space, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize, cloneDeep, keyBy, orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Libraries/Testimonies/useTestimoniesResource';
import { useEffect, useMemo, useState } from 'react';
import type { SuspectCard } from 'types';
import { PopoverStrongAnswers } from './PopoverStrongAnswers';
import { calculateSuspectAnswersData } from './utils';

type TestimonyAnswerExpandedRowProps = {
  testimonyId: string;
  question: string;
  answers: TestimonyAnswers;
  suspects: Dictionary<SuspectCard>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
};

export function TestimonyAnswerExpandedRow({
  answers,
  suspects,
  addEntryToUpdate,
  testimonyId,
  question,
}: TestimonyAnswerExpandedRowProps) {
  const [cardWidth, ref] = useCardWidth(12);
  const { queryParams, is } = useQueryParams({ sortSuspectsBy: 'answers' });
  const isBatchEnabled = is('enableBatch');
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'answers';

  const list = useMemo(() => {
    const res = Object.keys(suspects).map((suspectCardId) => {
      return calculateSuspectAnswersData(suspectCardId, testimonyId, answers);
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
  }, [answers, suspects, testimonyId, sortSuspectsBy]);

  const [selection, setSelection] = useState<string[]>([]);

  return (
    <Space direction="vertical">
      <BatchOptions
        addEntryToUpdate={addEntryToUpdate}
        answers={answers}
        list={list}
        question={question}
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
                cardId={entry.imageId}
                cardWidth={cardWidth}
                className={entry.values.length > 1 || entry.enoughData ? undefined : 'grayscale'}
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
  question: string;
  selection: string[];
  setSelection: (selection: string[]) => void;
  suspects: Dictionary<SuspectCard>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
  list: ReturnType<typeof calculateSuspectAnswersData>[];
  answers: TestimonyAnswers;
};

function BatchOptions({
  question,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: ok
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
              return !e.complete && !e.values.includes(4) && !e.values.includes(-4);
            })
            .map((e) => e.suspectCardId);

    // Special filter for suspects with no values
    if (activeFilters.includes('empty')) {
      const emptySelection = Object.values(listDict)
        .filter((e) => e.values.length === 0)
        .map((e) => e.suspectCardId);
      setSelection(emptySelection);
      return;
    }

    if (activeFilters.includes('incompletePos')) {
      const onlyIncompletePosSelection = Object.values(listDict)
        .filter((e) => !e.complete && e.yesCount < 4 && e.yesCount > 0 && e.noCount === 0)
        .map((e) => e.suspectCardId);
      setSelection(onlyIncompletePosSelection);
      return;
    }

    if (activeFilters.includes('incompleteNeg')) {
      const onlyIncompleteNegSelection = Object.values(listDict)
        .filter((e) => !e.complete && e.noCount < 4 && e.noCount > 0 && e.yesCount === 0)
        .map((e) => e.suspectCardId);
      setSelection(onlyIncompleteNegSelection);
      return;
    }

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
      newAnswers[suspectId] = [...(newAnswers[suspectId] || []), value as 4 | -4];
    });
    addEntryToUpdate(testimonyId, newAnswers);
    setActiveFilters([]);
  };

  return (
    <>
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
            <Typography.Text className="nowrap mr-2">
              Selected {selection.length.toString().padStart(3, '0')}
            </Typography.Text>
            <Flex align="center" className="boxed" gap={6} justify="center" wrap>
              <FilterEntry
                activeFilters={activeFilters}
                end
                filter="empty"
                updateActiveFilter={updateActiveFilter}
              />
            </Flex>
            <Flex align="center" className="boxed" gap={6} justify="center" wrap>
              <FilterEntry
                activeFilters={activeFilters}
                end
                filter="incompletePos"
                label="Incomplete+"
                updateActiveFilter={updateActiveFilter}
              />
              <FilterEntry
                activeFilters={activeFilters}
                end
                filter="incompleteNeg"
                label="Incomplete-"
                updateActiveFilter={updateActiveFilter}
              />
            </Flex>
            <Flex align="center" className="boxed" gap={6} justify="center" wrap>
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
                end
                filter="latino"
                updateActiveFilter={updateActiveFilter}
              />
            </Flex>
            <Flex align="center" gap={6}>
              <Button danger onClick={() => setActiveFilters([])} size="small">
                Clear
              </Button>
              <Popconfirm onConfirm={() => onApplyBatch(4)} title="Apply +4 to selected suspects?">
                <Button className="ml-10" disabled={selection.length === 0} size="small" type="primary">
                  Apply +4
                </Button>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm onConfirm={() => onApplyBatch(-4)} title="Apply -4 to selected suspects?">
                <Button disabled={selection.length === 0} size="small" type="primary">
                  Apply -4
                </Button>
              </Popconfirm>
            </Flex>
          </>
        )}
      </Flex>
      {selection.length > 0 && (
        <FloatButton.Group shape="square" style={{ insetInlineEnd: 94 }}>
          <FloatButton
            badge={{ count: selection.length, color: 'green', size: 'small' }}
            icon="👍"
            onClick={() => onApplyBatch(4)}
            tooltip={{ title: question, placement: 'left' }}
          />
          <FloatButton
            badge={{ count: selection.length, color: 'red', size: 'small' }}
            icon="👎"
            onClick={() => onApplyBatch(-4)}
            tooltip={{ title: question, placement: 'left' }}
          />
          <FloatButton
            icon={<ExpandOutlined />}
            onClick={() => setActiveFilters([])}
            tooltip={{ title: 'Clear selection', placement: 'left' }}
          />
          <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
      )}
    </>
  );
}

type FilterEntryProps = {
  filter: string;
  label?: string;
  activeFilters: string[];
  updateActiveFilter: (filter: string) => void;
  end?: boolean;
};

function FilterEntry({ filter, activeFilters, updateActiveFilter, end, label }: FilterEntryProps) {
  return (
    <>
      <span>
        <Checkbox checked={activeFilters.includes(filter)} onClick={() => updateActiveFilter(filter)} />{' '}
        {label ?? capitalize(filter)}
      </span>
      {!end && <Divider type="vertical" />}
    </>
  );
}
