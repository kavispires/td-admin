import { TrophyFilled } from '@ant-design/icons';
import { Flex, Progress, Space } from 'antd';
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
      Object.keys(answers ?? {}).map((imageId) => {
        const suspectCardId = `us-${imageId.split('-')[2]}`;
        const values = answers[imageId];
        const enoughData = values.length > 2;
        const reliability = values.length > 4;
        const total = Math.max(values.length, 5);
        const yesPercentage = Math.round((values.filter((v) => v === 1).length / total) * 100);
        const noPercentage = Math.round((values.filter((v) => v === 0).length / total) * 100);
        const blankPercentage = Math.round(((total - yesPercentage + noPercentage) / total) * 100);
        const complete = values.length >= 5;

        return {
          imageId,
          suspectCardId,
          enoughData,
          reliability,
          yesPercentage,
          noPercentage,
          blankPercentage,
          complete,
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
              {suspects[entry.suspectCardId].name.pt}{' '}
              {entry.complete && <TrophyFilled style={{ color: 'gold' }} />}
            </div>
            {entry.enoughData ? (
              <Progress
                percent={entry.noPercentage}
                size={[cardWidth, 20]}
                status="exception"
                success={{ percent: entry.yesPercentage }}
                showInfo={false}
              />
            ) : (
              <Progress
                percent={entry.noPercentage}
                size={[cardWidth, 10]}
                status="exception"
                success={{ percent: entry.yesPercentage }}
                showInfo={false}
              />
            )}
          </Flex>
        );
      })}
    </Space>
  );
}
