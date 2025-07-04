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
    <Flex align="center" className="my-2" gap={8}>
      <Typography.Text>Feature Highlight:</Typography.Text>{' '}
      <Select
        allowClear
        onChange={(value) => addParam('activeFeature', value)}
        options={flatFeatures}
        size="small"
        style={{ width: 200 }}
        value={queryParams.get('activeFeature') || undefined}
      />
    </Flex>
  );
}
