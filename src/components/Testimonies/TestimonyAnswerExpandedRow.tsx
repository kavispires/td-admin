import { ExpandOutlined } from '@ant-design/icons';
import { SuspectImageCard } from '@components/Suspects/SuspectImageCard';
import { useCardWidth } from '@hooks/useCardWidth';
import { useQueryParams } from '@hooks/useQueryParams';
import type { TestimonyAnswers } from '@pages/Libraries/Testimonies/useTestimoniesResource';
import type { SuspectCardData } from '@types';
import { Button, Checkbox, Divider, Flex, FloatButton, Popconfirm, Space, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { capitalize, cloneDeep, keyBy, orderBy } from 'lodash';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { PopoverStrongAnswers } from './PopoverStrongAnswers';
import { calculateSuspectAnswersData, filterAdultSuspects } from './utils';

type TestimonyAnswerExpandedRowProps = {
  testimonyId: string;
  statement: string;
  answers: TestimonyAnswers;
  suspects: Dictionary<SuspectCardData>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
};

export function TestimonyAnswerExpandedRow({
  answers,
  suspects,
  addEntryToUpdate,
  testimonyId,
  statement,
}: TestimonyAnswerExpandedRowProps) {
  const [cardWidth, ref] = useCardWidth(12, { maxWidth: 168 });
  const { queryParams, is } = useQueryParams({ sortSuspectsBy: 'answers' });
  const isBatchEnabled = is('enableBatch');
  const onlyMissingValues = is('onlyMissingValues');
  const sortSuspectsBy = queryParams.get('sortSuspectsBy') ?? 'answers';

  // Filter to only include adult suspects in testimonies
  const filteredSuspects = useMemo(() => filterAdultSuspects(suspects), [suspects]);

  const list = useMemo(() => {
    let res = Object.keys(filteredSuspects).map((suspectCardId) => {
      return calculateSuspectAnswersData(suspectCardId, testimonyId, answers);
    });

    if (onlyMissingValues) {
      res = res.filter((entry) => entry.total < 4);
    }

    if (sortSuspectsBy === 'answers') {
      return orderBy(
        res,
        [
          'reliable',
          'enoughData',
          (o) => o.total,
          'yesPercentage',
          'noPercentage',
          (o) => Number(o.suspectCardId.split('-')[1]),
        ],
        ['desc', 'desc', 'desc', 'desc', 'desc', 'asc'],
      );
    }

    if (sortSuspectsBy === 'new') {
      return orderBy(
        res,
        [
          (o) => (Number(o.suspectCardId.split('-')[1]) > 200 ? 0 : 1),
          (o) => Number(o.suspectCardId.split('-')[1]),
        ],
        ['asc', 'asc'],
      );
    }

    return orderBy(res, (o) => Number(o.suspectCardId.split('-')[1]), ['asc']);
  }, [answers, filteredSuspects, testimonyId, sortSuspectsBy, onlyMissingValues]);

  const [selection, setSelection] = useState<string[]>([]);

  return (
    <Space orientation="vertical">
      <BatchOptions
        addEntryToUpdate={addEntryToUpdate}
        answers={answers}
        list={list}
        selection={selection}
        setSelection={setSelection}
        statement={statement}
        suspects={suspects}
        testimonyId={testimonyId}
      >
        <Space
          ref={ref}
          size="large"
          wrap
        >
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
                {/* biome-ignore lint/a11y/noStaticElementInteractions: interactive div with conditional pointer behavior */}
                <div
                  onClick={() => {
                    if (isBatchEnabled) {
                      if (selection.includes(entry.suspectCardId)) {
                        setSelection((prev) => prev.filter((id) => id !== entry.suspectCardId));
                      } else {
                        setSelection((prev) => [...prev, entry.suspectCardId]);
                      }
                    }
                  }}
                  style={{ cursor: isBatchEnabled ? 'pointer' : 'default' }}
                >
                  <SuspectImageCard
                    cardId={entry.imageId}
                    cardWidth={cardWidth}
                    className={entry.values.length > 1 || entry.enoughData ? undefined : 'grayscale'}
                    preview={!isBatchEnabled}
                  />
                </div>
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
      </BatchOptions>
    </Space>
  );
}

type BatchOptionsProps = {
  testimonyId: string;
  statement: string;
  selection: string[];
  setSelection: (selection: string[]) => void;
  suspects: Dictionary<SuspectCardData>;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
  list: ReturnType<typeof calculateSuspectAnswersData>[];
  answers: TestimonyAnswers;
  children: ReactNode;
};

function BatchOptions({
  statement,
  testimonyId,
  selection,
  setSelection,
  suspects,
  addEntryToUpdate,
  list,
  answers,
  children,
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
      const searchString = [suspect.gender, suspect.race, suspect.build, suspect.height];
      if (suspect.age === '18-21') {
        searchString.push('<20');
      }
      if (suspect.age === '21-30') {
        searchString.push('21-30');
      }
      if (suspect.age === '30-40') {
        searchString.push('30-40');
      }
      if (suspect.age === '40-50') {
        searchString.push('40-50');
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

  const options = (
    <>
      <Typography.Text className="nowrap mr-2">
        Selected {selection.length.toString().padStart(3, '0')}
      </Typography.Text>

      <Flex
        align="center"
        className="boxed"
        gap={6}
        justify="center"
        wrap
      >
        <FilterEntry
          activeFilters={activeFilters}
          end
          filter="empty"
          updateActiveFilter={updateActiveFilter}
        />
      </Flex>
      <Flex
        align="center"
        className="boxed"
        gap={6}
        justify="center"
        wrap
      >
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
      <Flex
        align="center"
        className="boxed"
        gap={6}
        justify="center"
        wrap
      >
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
          filter="<20"
          updateActiveFilter={updateActiveFilter}
        />
        <FilterEntry
          activeFilters={activeFilters}
          filter="21-30"
          updateActiveFilter={updateActiveFilter}
        />
        <FilterEntry
          activeFilters={activeFilters}
          filter="30-40"
          updateActiveFilter={updateActiveFilter}
        />
        <FilterEntry
          activeFilters={activeFilters}
          filter="40-50"
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
          filter="white"
          updateActiveFilter={updateActiveFilter}
        />
        <FilterEntry
          activeFilters={activeFilters}
          end
          filter="brown"
          updateActiveFilter={updateActiveFilter}
        />
      </Flex>
      <Flex
        align="center"
        gap={6}
      >
        <Button
          danger
          onClick={() => setActiveFilters([])}
          size="small"
        >
          Clear
        </Button>
        <Popconfirm
          onConfirm={() => onApplyBatch(4)}
          title="Apply +4 to selected suspects?"
        >
          <Button
            className="ml-10"
            disabled={selection.length === 0}
            size="small"
            type="primary"
          >
            Apply +4
          </Button>
        </Popconfirm>
        <Divider orientation="vertical" />
        <Popconfirm
          onConfirm={() => onApplyBatch(-4)}
          title="Apply -4 to selected suspects?"
        >
          <Button
            disabled={selection.length === 0}
            size="small"
            type="primary"
          >
            Apply -4
          </Button>
        </Popconfirm>
      </Flex>
    </>
  );

  return (
    <>
      <Flex
        align="center"
        className="mb-4"
        gap={6}
        justify="space-between"
      >
        <Flex vertical>
          <Flex
            gap={3}
            vertical
          >
            <Switch
              checkedChildren="On"
              onChange={(checked) => {
                if (checked) {
                  addParam('enableBatch', true);
                } else {
                  removeParam('enableBatch');
                }
              }}
              size="small"
              unCheckedChildren="Off"
              value={isBatchEnabled}
            />
            <Typography.Text
              className="nowrap"
              style={{ minWidth: '5ch' }}
            >
              Batch Selection
            </Typography.Text>
          </Flex>
          <Divider className="my-0" />
          <Checkbox
            checked={is('onlyMissingValues')}
            onChange={(e) => addParam('onlyMissingValues', e.target.checked)}
          >
            Total {'<'} 4 only
          </Checkbox>
        </Flex>
        {isBatchEnabled && options}
      </Flex>
      {children}

      {isBatchEnabled && (
        <>
          <Divider />
          <Flex
            align="center"
            className="mb-4"
            gap={6}
            justify="space-between"
          >
            {options}
          </Flex>
        </>
      )}
      {selection.length > 0 && (
        <FloatButton.Group
          shape="square"
          style={{ insetInlineEnd: 94 }}
        >
          <FloatButton
            badge={{ count: selection.length, color: 'green', size: 'small' }}
            icon="👍"
            onClick={() => onApplyBatch(4)}
            tooltip={{ title: statement, placement: 'left' }}
          />
          <FloatButton
            badge={{ count: selection.length, color: 'red', size: 'small' }}
            icon="👎"
            onClick={() => onApplyBatch(-4)}
            tooltip={{ title: statement, placement: 'left' }}
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
        <Checkbox
          checked={activeFilters.includes(filter)}
          onClick={() => updateActiveFilter(filter)}
        />{' '}
        {label ?? capitalize(filter)}
      </span>
      {!end && <Divider orientation="vertical" />}
    </>
  );
}
