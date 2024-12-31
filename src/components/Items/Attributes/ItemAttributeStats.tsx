import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Flex, Progress, Tooltip, Typography } from 'antd';
import { Stat } from 'components/Common/Stat';
import { useMemo } from 'react';
import type { ItemAttributesValues, ItemAttribute } from 'types';
import { ATTRIBUTE_VALUE } from 'utils/constants';

type ItemAttributeStatsProps = {
  attributesList: ItemAttribute[];
  itemAttributeValues: ItemAttributesValues;
};

export function ItemAttributeStats({ attributesList, itemAttributeValues }: ItemAttributeStatsProps) {
  const { completion, isDeterministic, value, isOpposing, relevancy } = useMemo(() => {
    const total = attributesList.length;
    const completed = Object.keys(itemAttributeValues.attributes).length;
    const completion = Math.floor((completed / total) * 100);

    let isDeterministic = false;
    let isOpposing = false;
    let unclearCount = 0;
    const value = Object.values(itemAttributeValues.attributes).reduce((acc: number, v) => {
      if (v <= 0) {
        if (v === ATTRIBUTE_VALUE.UNCLEAR) {
          unclearCount += 1;
        }
        if (v === ATTRIBUTE_VALUE.OPPOSITE) {
          isOpposing = true;
          acc += v / 2;
        }
        return acc;
      }
      if (v === ATTRIBUTE_VALUE.DETERMINISTIC) {
        isDeterministic = true;
      }

      return acc + v;
    }, 0);

    const relevancy = Math.floor(((completed - unclearCount) / total) * 100);

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
        <Tooltip title="The percentage of conclusive attributes (not unclear)">
          <Stat label="Reliability">{relevancy}%</Stat>
        </Tooltip>
      </Flex>
    </div>
  );
}
