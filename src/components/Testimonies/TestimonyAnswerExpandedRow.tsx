import { TrophyFilled } from '@ant-design/icons';
import { Flex, Progress, Space, Tooltip } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
import { calculateSuspectAnswersData } from './utils';

type TestimonyAnswerExpandedRowProps = {
  answers: TestimonyAnswers;
  suspects: Dictionary<SuspectCard>;
};

export function TestimonyAnswerExpandedRow({ answers, suspects }: TestimonyAnswerExpandedRowProps) {
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
            <Tooltip
              title={`Values: ${entry.values.join(', ')} : ${entry.result ? entry.result : entry.projection ? `${entry.projection}*` : ''}`}
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
          </Flex>
        );
      })}
    </Space>
  );
}
