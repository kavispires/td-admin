import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Flex, Progress, Typography } from 'antd';
import { Stat } from 'components/Common/Stat';
import { useMemo } from 'react';
import { ItemAtributesValues, ItemAttributes } from 'types';
import { ATTRIBUTE_VALUE } from 'utils/constants';

type ItemAttributeStatsProps = {
  attributesList: ItemAttributes[];
  itemAttributeValues: ItemAtributesValues;
};

export function ItemAttributeStats({ attributesList, itemAttributeValues }: ItemAttributeStatsProps) {
  const { completion, isDeterministic, value, isOpposing, relevancy } = useMemo(() => {
    const total = attributesList.length;
    const completed = Object.keys(itemAttributeValues.attributes).length;
    const completion = Math.round((completed / total) * 100);

    let isDeterministic = false;
    let isOpposing = false;
    let irrelevantCount = 0;
    const value = Object.values(itemAttributeValues.attributes).reduce((acc: number, v) => {
      if (v <= 0) {
        if (v === ATTRIBUTE_VALUE.IRRELEVANT) {
          irrelevantCount += 1;
        }
        if (v === ATTRIBUTE_VALUE.OPPOSITE) {
          isOpposing = true;
        }
        return acc;
      }
      if (v === ATTRIBUTE_VALUE.DETERMINISTIC) {
        isDeterministic = true;
      }

      return acc + v;
    }, 0);

    const relevancy = Math.round(((completed - irrelevantCount) / total) * 100);

    return { completion, isDeterministic, value, isOpposing, relevancy };
  }, [attributesList, itemAttributeValues.attributes]);

  return (
    <div>
      <Typography.Text strong>Completion</Typography.Text>
      <Progress percent={completion} size="small" />
      <Typography.Text strong>Stats</Typography.Text>
      <Flex vertical>
        <Stat label="Deterministic">
          {isDeterministic ? (
            <CheckCircleFilled style={{ color: 'green' }} />
          ) : (
            <CloseCircleOutlined style={{ color: 'red' }} />
          )}
        </Stat>
        <Stat label="Opposing">
          {isOpposing ? (
            <CheckCircleFilled style={{ color: 'CornflowerBlue' }} />
          ) : (
            <CloseCircleOutlined style={{ color: 'grey' }} />
          )}
        </Stat>
        <Stat label="Value">{value}</Stat>
        <Stat label="Reliability">{relevancy}%</Stat>
      </Flex>
    </div>
  );
}
