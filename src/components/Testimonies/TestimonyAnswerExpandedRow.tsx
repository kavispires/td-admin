import { TrophyFilled } from '@ant-design/icons';
import { Flex, Progress, Space, Tooltip } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';

type TestimonyAnswerExpandedRowProps = {
  answers: TestimonyAnswers;
  suspects: Dictionary<SuspectCard>;
};

export function TestimonyAnswerExpandedRow({ answers, suspects }: TestimonyAnswerExpandedRowProps) {
  const [cardWidth, ref] = useCardWidth(12);
  const list = useMemo(() => {
    return orderBy(
      Object.keys(answers ?? {}).map((suspectCardId) => {
        const num = suspectCardId.split('-')[1];
        const imageId = `us-gb-${num}`;
        const values = answers[suspectCardId];
        const enoughData = values.length > 2;
        const reliability = values.length > 4;
        const total = Math.max(values.length, 5);
        const yesCount = values.filter((v) => v === 1).length;
        const yesPercentage = Math.round((yesCount / total) * 100);
        const noCount = values.filter((v) => v === 0).length;
        const noPercentage = Math.round((noCount / total) * 100);
        const blankPercentage = Math.round(((total - yesCount - noCount) / total) * 100);
        const complete = values.length >= 5;
        if (complete) {
          console.log({
            suspectCardId,
            values,
            yesPercentage,
            noPercentage,
            blankPercentage,
            total,
          });
        }

        return {
          imageId,
          suspectCardId,
          enoughData,
          reliability,
          yesPercentage,
          noPercentage,
          blankPercentage,
          complete,
          values,
        };
      }),
      ['complete', 'reliability', 'enoughData', 'percentage'],
      ['desc', 'desc', 'desc', 'desc'],
    );
  }, [answers]);

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
            <div>
              <Tooltip title={entry.suspectCardId}>{suspects[entry.suspectCardId].name.pt}</Tooltip>{' '}
              {entry.complete && (
                <Tooltip title="Complete: It has 5 or more answers">
                  <TrophyFilled style={{ color: 'gold' }} />
                </Tooltip>
              )}
            </div>
            <Tooltip title={`Values: ${entry.values.join(', ')}`}>
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
          </Flex>
        );
      })}
    </Space>
  );
}
