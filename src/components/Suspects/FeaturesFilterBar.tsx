import { Flex, Select, Switch, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import type { SuspectCard } from 'types';
import { FEATURES_BY_GROUP } from './options';

const flatFeatures = orderBy(
  FEATURES_BY_GROUP.reduce((acc: { value: string; label: string }[], group) => {
    group.features.forEach((feature) => {
      acc.push({ value: feature.id, label: `${group.title}: ${feature.label}` });
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
        style={{ width: 275 }}
        value={queryParams.get('activeFeature') || undefined}
      />
    </Flex>
  );
}

type ActiveFeatureSwitchProps = {
  entry: SuspectCard;
  updateSuspectFeature: (id: string, feature: string) => void;
  activeFeature?: string;
};

export function ActiveFeatureSwitch({
  entry,
  updateSuspectFeature,
  activeFeature,
}: ActiveFeatureSwitchProps) {
  if (!activeFeature) return null;

  return (
    <Flex className="mt-2 mb-4" gap={8}>
      <Typography.Text keyboard>{activeFeature}:</Typography.Text>
      <Switch
        checked={entry.features?.includes(activeFeature)}
        checkedChildren={'✓'}
        onChange={() => updateSuspectFeature(entry.id, activeFeature)}
        unCheckedChildren={'✗'}
      />
    </Flex>
  );
}
