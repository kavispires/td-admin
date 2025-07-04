import { TrophyFilled } from '@ant-design/icons';
import { Button, Flex, Popover, Progress, Space, Tooltip, Typography } from 'antd';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import type { SuspectCard } from 'types';

type PopoverStrongAnswersProps = {
  testimonyId: string;
  answers: TestimonyAnswers;
  addEntryToUpdate: (testimonyId: string, answers: TestimonyAnswers) => void;
  barWidth: number;
  suspect: SuspectCard;
  values: number[];
  resolution: string | null;
  projection: string | null;
  yesPercentage: number;
  noPercentage: number;
  complete: boolean;
  enoughData: boolean;
  showName?: boolean;
};

export function PopoverStrongAnswers({
  suspect,
  values,
  resolution,
  projection,
  yesPercentage,
  noPercentage,
  complete,
  enoughData,
  testimonyId,
  addEntryToUpdate,
  answers,
  barWidth,
  showName,
}: PopoverStrongAnswersProps) {
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
    <Popover
      content={
        <Flex gap={4} vertical>
          <Typography.Text type="secondary">{values.join(', ')}</Typography.Text>

          <Button block icon="👍" onClick={() => onAddStrongFit(suspect.id)}>
            {' '}
            Add strong fit
          </Button>
          <Button block icon="👎" onClick={() => onAddStrongUnfit(suspect.id)}>
            {' '}
            Add strong unfit
          </Button>
          <Space.Compact>
            <Button block icon="❌" onClick={() => onRemoveStrongFit(suspect.id)} size="small">
              fit
            </Button>
            <Button block icon="❌" onClick={() => onRemoveStrongUnfit(suspect.id)} size="small">
              unfit
            </Button>
          </Space.Compact>
        </Flex>
      }
      title={`Add strong fit/unfit answer to ${suspect.name.pt}`}
      trigger="click"
    >
      {showName && (
        <div>
          <Tooltip title={suspect.id}>{suspect.name.pt}</Tooltip>{' '}
          {complete && (
            <Tooltip title="Complete: It has 5 or more answers">
              <TrophyFilled style={{ color: 'gold' }} />
            </Tooltip>
          )}
        </div>
      )}
      <Flex align="flex-start" gap={12}>
        <Tooltip
          title={`Values: ${values.join(', ')} : ${resolution ? resolution : projection ? `${projection}*` : ''}`}
        >
          {enoughData ? (
            <Progress
              percent={noPercentage + yesPercentage}
              showInfo={false}
              size={[barWidth, 20]}
              status="exception"
              success={{ percent: yesPercentage }}
            />
          ) : (
            <Progress
              percent={noPercentage + yesPercentage}
              showInfo={false}
              size={[barWidth, 10]}
              status="exception"
              success={{ percent: yesPercentage }}
            />
          )}
        </Tooltip>
        {!showName && complete && (
          <Tooltip title="Complete: It has 5 or more answers">
            <TrophyFilled style={{ color: 'gold' }} />
          </Tooltip>
        )}
      </Flex>
    </Popover>
  );
}
