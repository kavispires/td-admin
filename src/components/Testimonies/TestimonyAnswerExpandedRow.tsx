import { Flex, Space } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
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

    return orderBy(res, (o) => Number(o.suspectCardId.split('-')[1]), ['asc']);
  }, [answers, suspects, sortSuspectsBy]);

  return (
    <Space wrap ref={ref} size="large">
      {list.map((entry) => {
        return (
          <Flex key={entry.suspectCardId} vertical gap={4}>
            <ImageCard
              id={entry.imageId}
              width={cardWidth}
              className={entry.values.length > 1 ? undefined : 'grayscale'}
            />
            <PopoverStrongAnswers
              values={entry.values}
              resolution={entry.resolution}
              projection={entry.projection}
              yesPercentage={entry.yesPercentage}
              noPercentage={entry.noPercentage}
              complete={entry.complete}
              enoughData={entry.enoughData}
              suspect={suspects[entry.suspectCardId]}
              testimonyId={testimonyId}
              answers={answers}
              addEntryToUpdate={addEntryToUpdate}
              barWidth={cardWidth}
              showName
            />
          </Flex>
        );
      })}
    </Space>
  );
}
