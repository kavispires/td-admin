import { Button, Drawer, Typography } from 'antd';
import { capitalize, orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import type { SuspectCard } from 'types';
import { FEATURES_BY_GROUP } from './options';

type SuspectsStatsProps = {
  data: Dictionary<SuspectCard>;
};

function orderStat(group: NumberDictionary, total: number) {
  return orderBy(
    Object.entries(group).map(([key, value]) => ({
      key,
      label: capitalize(key),
      value,
      percentage: Math.round((value / total) * 100),
    })),
    ['percentage'],
    ['desc'],
  );
}

export function SuspectsStats({ data }: SuspectsStatsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button block onClick={() => setOpen(true)}>
        See Stats
      </Button>
      {open && <StatsDrawer data={data} onClose={() => setOpen(false)} open={open} />}
    </>
  );
}

type StatsDrawerProps = {
  data: Dictionary<SuspectCard>;
  open: boolean;
  onClose: () => void;
};

function StatsDrawer({ data, open, onClose }: StatsDrawerProps) {
  const { ages, races, genders, builds, heights } = useMemo(() => {
    const ageGroup: NumberDictionary = {};
    const raceGroup: NumberDictionary = {};
    const genderGroup: NumberDictionary = {};
    const buildGroup: NumberDictionary = {};
    const heightGroup: NumberDictionary = {};

    Object.values(data).forEach((suspect) => {
      if (!suspect.age) {
        console.log('🎂 Missing age for suspect:', suspect.id);
      }
      ageGroup[suspect.age] = (ageGroup[suspect.age] ?? 0) + 1;
      if (!suspect.race) {
        console.log('🌍 Missing race for suspect:', suspect.id);
      }
      raceGroup[suspect.race] = (raceGroup[suspect.race] ?? 0) + 1;
      if (!suspect.gender) {
        console.log('⚧️ Missing gender for suspect:', suspect.id);
      }
      genderGroup[suspect.gender] = (genderGroup[suspect.gender] ?? 0) + 1;
      if (!suspect.build) {
        console.log('💪 Missing build for suspect:', suspect.id);
      }
      buildGroup[suspect.build || '?'] = (buildGroup[suspect.build || '?'] ?? 0) + 1;
      if (!suspect.height) {
        console.log('📏 Missing height for suspect:', suspect.id);
      }
      heightGroup[suspect.height || '?'] = (heightGroup[suspect.height || '?'] ?? 0) + 1;
    });

    const total = Object.keys(data).length;

    return {
      ages: orderStat(ageGroup, total),
      races: orderStat(raceGroup, total),
      genders: orderStat(genderGroup, total),
      builds: orderStat(buildGroup, total),
      heights: orderStat(heightGroup, total),
    };
  }, [data]);

  const features = useMemo(() => {
    const featureGroup: NumberDictionary = {};
    Object.values(data).forEach((suspect) => {
      suspect.features?.forEach((feature) => {
        featureGroup[feature] = (featureGroup[feature] ?? 0) + 1;
      });
    });

    const total = Object.keys(data).length;

    const flattenedFeatureGroup = FEATURES_BY_GROUP.reduce((acc: string[], group) => {
      const keys = group.features.map((feature) => feature.id);
      acc.push(...keys);
      return acc;
    }, []);

    return orderBy(orderStat(featureGroup, total), (o) => flattenedFeatureGroup.indexOf(o.key), ['asc']);
  }, [data]);

  return (
    <Drawer onClose={onClose} open={open} placement="right" title="Suspects Statistics" width={400}>
      <Typography.Text strong>Race</Typography.Text>
      <ul className="statistic__list">
        {races.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <Typography.Text strong>Gender</Typography.Text>
      <ul className="statistic__list">
        {genders.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <Typography.Text strong>Age</Typography.Text>
      <ul className="statistic__list">
        {ages.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <Typography.Text strong>Build</Typography.Text>
      <ul className="statistic__list">
        {builds.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <Typography.Text strong>Height</Typography.Text>
      <ul className="statistic__list">
        {heights.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>

      <Typography.Text strong>Features</Typography.Text>
      <ul className="statistic__list">
        {features.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}% ({entry.value})
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
