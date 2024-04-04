import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Flex, Progress, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { ItemAtributesValues, ItemAttributes } from 'types';

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
        if (v === -1) {
          irrelevantCount += 1;
        }
        if (v === -10) {
          isOpposing = true;
        }
        return acc;
      }
      if (v === 10) {
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
        <Typography.Text>
          Deterministic{' '}
          <Tag>
            {isDeterministic ? (
              <CheckCircleFilled style={{ color: 'green' }} />
            ) : (
              <CloseCircleOutlined style={{ color: 'red' }} />
            )}
          </Tag>
        </Typography.Text>
        <Typography.Text>
          Opposing{' '}
          <Tag>
            {isOpposing ? (
              <CheckCircleFilled style={{ color: 'blue' }} />
            ) : (
              <CloseCircleOutlined style={{ color: 'grey' }} />
            )}
          </Tag>
        </Typography.Text>
        <Typography.Text>
          Value <Tag>{value}</Tag>
        </Typography.Text>
        <Typography.Text>
          Reliability <Tag>{relevancy}%</Tag>
        </Typography.Text>
      </Flex>
    </div>
  );
}
