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
      trigger="click"
      title={`Add strong fit/unfit answer to ${suspect.name.pt}`}
      content={
        <Flex vertical gap={4}>
          <Typography.Text type="secondary">{values.join(', ')}</Typography.Text>

          <Button icon="👍" block onClick={() => onAddStrongFit(suspect.id)}>
            {' '}
            Add strong fit
          </Button>
          <Button icon="👎" block onClick={() => onAddStrongUnfit(suspect.id)}>
            {' '}
            Add strong unfit
          </Button>
          <Space.Compact>
            <Button icon="❌" size="small" block onClick={() => onRemoveStrongFit(suspect.id)}>
              fit
            </Button>
            <Button icon="❌" size="small" block onClick={() => onRemoveStrongUnfit(suspect.id)}>
              unfit
            </Button>
          </Space.Compact>
        </Flex>
      }
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
              size={[barWidth, 20]}
              status="exception"
              success={{ percent: yesPercentage }}
              showInfo={false}
            />
          ) : (
            <Progress
              percent={noPercentage + yesPercentage}
              size={[barWidth, 10]}
              status="exception"
              success={{ percent: yesPercentage }}
              showInfo={false}
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
