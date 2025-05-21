import { TrophyFilled } from '@ant-design/icons';
import { Button, Flex, Popover, Progress, Space, Tooltip, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
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
  const { queryParams } = useQueryParams({ sortSuspectsBy: 'answers' });
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

    return res;
  }, [answers, suspects, sortSuspectsBy]);

  const onAddStrongFit = (suspectCardId: string) => {
    const newAnswers = { ...answers };
    newAnswers[suspectCardId] = [...(newAnswers[suspectCardId] || []), 3];
    addEntryToUpdate(testimonyId, newAnswers);
  };

  const onAddStrongUnfit = (suspectCardId: string) => {
    const newAnswers = { ...answers };
    newAnswers[suspectCardId] = [...(newAnswers[suspectCardId] || []), -3];
    addEntryToUpdate(testimonyId, newAnswers);
  };

  const onRemoveStrongFit = (suspectCardId: string) => {
    const newAnswers = { ...answers };
    // Find the index of the first occurrence of 3
    const index = newAnswers[suspectCardId]?.findIndex((value) => value === 3);
    // If found, remove only that occurrence
    if (index !== -1 && index !== undefined) {
      newAnswers[suspectCardId] = [
        ...newAnswers[suspectCardId].slice(0, index),
        ...newAnswers[suspectCardId].slice(index + 1),
      ];
    }
    addEntryToUpdate(testimonyId, newAnswers);
  };

  const onRemoveStrongUnfit = (suspectCardId: string) => {
    const newAnswers = { ...answers };
    // Find the index of the first occurrence of -3
    const index = newAnswers[suspectCardId]?.findIndex((value) => value === -3);
    // If found, remove only that occurrence
    if (index !== -1 && index !== undefined) {
      newAnswers[suspectCardId] = [
        ...newAnswers[suspectCardId].slice(0, index),
        ...newAnswers[suspectCardId].slice(index + 1),
      ];
    }
    addEntryToUpdate(testimonyId, newAnswers);
  };

  return (
    <Space wrap ref={ref} size="large">
      {list.map((entry) => {
        return (
          <Flex key={entry.suspectCardId} vertical gap={4}>
            <ImageCard
              id={entry.imageId}
              width={cardWidth}
              className={entry.enoughData ? undefined : 'grayscale'}
            />
            <Popover
              trigger="click"
              title={`Add strong fit/unfit answer to ${suspects[entry.suspectCardId].name.pt}`}
              content={
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">{entry.values.join(', ')}</Typography.Text>

                  <Button icon="👍" block onClick={() => onAddStrongFit(entry.suspectCardId)}>
                    {' '}
                    Add strong fit
                  </Button>
                  <Button icon="👎" block onClick={() => onAddStrongUnfit(entry.suspectCardId)}>
                    {' '}
                    Add strong unfit
                  </Button>
                  <Space.Compact>
                    <Button
                      icon="❌"
                      size="small"
                      block
                      onClick={() => onRemoveStrongFit(entry.suspectCardId)}
                    >
                      fit
                    </Button>
                    <Button
                      icon="❌"
                      size="small"
                      block
                      onClick={() => onRemoveStrongUnfit(entry.suspectCardId)}
                    >
                      unfit
                    </Button>
                  </Space.Compact>
                </Flex>
              }
            >
              <div>
                <Tooltip title={entry.suspectCardId}>{suspects[entry.suspectCardId].name.pt}</Tooltip>{' '}
                {entry.complete && (
                  <Tooltip title="Complete: It has 5 or more answers">
                    <TrophyFilled style={{ color: 'gold' }} />
                  </Tooltip>
                )}
              </div>
              <Tooltip
                title={`Values: ${entry.values.join(', ')} : ${entry.resolution ? entry.resolution : entry.projection ? `${entry.projection}*` : ''}`}
              >
                {entry.enoughData ? (
                  <Progress
                    percent={entry.noPercentage + entry.yesPercentage}
                    size={[cardWidth, 20]}
                    status="exception"
                    success={{ percent: entry.yesPercentage }}
                    showInfo={false}
                  />
                ) : (
                  <Progress
                    percent={entry.noPercentage + entry.yesPercentage}
                    size={[cardWidth, 10]}
                    status="exception"
                    success={{ percent: entry.yesPercentage }}
                    showInfo={false}
                  />
                )}
              </Tooltip>
            </Popover>
          </Flex>
        );
      })}
    </Space>
  );
}
