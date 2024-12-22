import { SiderContent } from 'components/Layout';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { SuspectCard } from 'types';

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
  const { ages, ethnicities, genders, builds, heights } = useMemo(() => {
    const ageGroup: NumberDictionary = {};
    const ethnicityGroup: NumberDictionary = {};
    const genderGroup: NumberDictionary = {};
    const buildGroup: NumberDictionary = {};
    const heightGroup: NumberDictionary = {};

    Object.values(data).forEach((suspect) => {
      ageGroup[suspect.age] = (ageGroup[suspect.age] ?? 0) + 1;
      ethnicityGroup[suspect.ethnicity] = (ethnicityGroup[suspect.ethnicity] ?? 0) + 1;
      genderGroup[suspect.gender] = (genderGroup[suspect.gender] ?? 0) + 1;
      buildGroup[suspect.build] = (buildGroup[suspect.build] ?? 0) + 1;
      heightGroup[suspect.height] = (heightGroup[suspect.height] ?? 0) + 1;
    });

    const total = Object.keys(data).length;

    return {
      ages: orderStat(ageGroup, total),
      ethnicities: orderStat(ethnicityGroup, total),
      genders: orderStat(genderGroup, total),
      builds: orderStat(buildGroup, total),
      heights: orderStat(heightGroup, total),
    };
  }, [data]);

  return (
    <SiderContent>
      <div className="statistic">Stats</div>
      <div className="statistic__section">Ethnicity</div>
      <ul className="statistic__list">
        {ethnicities.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <div className="statistic__section">Gender</div>
      <ul className="statistic__list">
        {genders.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <div className="statistic__section">Age</div>
      <ul className="statistic__list">
        {ages.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <div className="statistic__section">Build</div>
      <ul className="statistic__list">
        {builds.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
      <div className="statistic__section">Height</div>
      <ul className="statistic__list">
        {heights.map((entry) => (
          <li key={entry.key}>
            <strong>{entry.label}</strong> - {entry.percentage}%
          </li>
        ))}
      </ul>
    </SiderContent>
  );
}
