import { Flex, Select, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import { FEATURES_BY_GROUP } from './SuspectDrawer';

const flatFeatures = orderBy(
  FEATURES_BY_GROUP.reduce((acc: { value: string; label: string }[], group) => {
    group.features.forEach((feature) => {
      acc.push({ value: feature.id, label: feature.label });
    });
    return acc;
  }, []),
  ['label'],
  ['asc'],
);

console.log(
  'flatFeatures',
  flatFeatures.map((f) => f.value),
);

export function FeaturesFilterBar() {
  const { addParam, queryParams } = useQueryParams();

  return (
    <Flex gap={8} align="center" className="my-2">
      <Typography.Text>Feature Highlight:</Typography.Text>{' '}
      <Select
        options={flatFeatures}
        style={{ width: 200 }}
        size="small"
        value={queryParams.get('activeFeature') || undefined}
        onChange={(value) => addParam('activeFeature', value)}
        allowClear
      />
    </Flex>
  );
}
