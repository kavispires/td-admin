import { TrophyFilled } from '@ant-design/icons';
import { Button, Divider, Flex, Popover, Progress, Space, Tooltip, Typography } from 'antd';
import type {
  TestimonyAnswers,
  TestimonyAnswersValues,
} from 'pages/Libraries/Testimonies/useTestimoniesResource';
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

  return (
    <Popover
      content={
        <Flex align="center" vertical>
          <Typography.Text type="secondary">{values.join(', ')}</Typography.Text>
          <Space.Compact>
            <Button icon="+" onClick={() => onAddValue(suspect.id, 1)} />
            <Button block icon="👍" onClick={() => onAddValue(suspect.id, 4)}>
              Fit
            </Button>
            <Button icon="❌" onClick={() => onRemoveValue(suspect.id, 4)} />
            <Button block icon="👎" onClick={() => onAddValue(suspect.id, -4)}>
              Unfit
            </Button>
            <Button icon="❌" onClick={() => onRemoveValue(suspect.id, -4)} />
          </Space.Compact>

          <Divider className="my-1" />
          <Space.Compact>
            <Button icon="-" onClick={() => onAddValue(suspect.id, -1)} />
            <Button block icon="⬆️" onClick={() => onAddValue(suspect.id, 32)}>
              Sure
            </Button>
            <Button icon="✖️" onClick={() => onRemoveValue(suspect.id, 32)} />
            <Button block icon="⬇️" onClick={() => onAddValue(suspect.id, -32)}>
              Sure
            </Button>
            <Button icon="✖️" onClick={() => onRemoveValue(suspect.id, -32)} />
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
          {!!resolution && resolution}
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
              // status="exception"
              strokeColor="#cf2323"
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
