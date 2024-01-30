import { Divider } from 'antd';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { SuspectCard } from 'types';

type SuspectsStatsProps = {
  data: Dictionary<SuspectCard>;
};

export function SuspectsStats({ data }: SuspectsStatsProps) {
  const { ages, ethnicities, genders } = useMemo(() => {
    const ageGroup: Record<string, number> = {};
    const ethnicityGroup: Record<string, number> = {};
    const genderGroup: Record<string, number> = {};

    Object.values(data).forEach((suspect) => {
      ageGroup[suspect.age] = (ageGroup[suspect.age] ?? 0) + 1;
      ethnicityGroup[suspect.ethnicity] = (ethnicityGroup[suspect.ethnicity] ?? 0) + 1;
      genderGroup[suspect.gender] = (genderGroup[suspect.gender] ?? 0) + 1;
    });

    const total = Object.keys(data).length;

    return {
      ages: orderBy(
        Object.entries(ageGroup).map(([key, value]) => ({
          key,
          label: capitalize(key),
          value,
          percentage: Math.round((value / total) * 100),
        })),
        ['percentage'],
        ['desc']
      ),
      ethnicities: orderBy(
        Object.entries(ethnicityGroup).map(([key, value]) => ({
          key,
          label: capitalize(key),
          value,
          percentage: Math.round((value / total) * 100),
        })),
        ['percentage'],
        ['desc']
      ),
      genders: orderBy(
        Object.entries(genderGroup).map(([key, value]) => ({
          key,
          label: capitalize(key),
          value,
          percentage: Math.round((value / total) * 100),
        })),
        ['percentage'],
        ['desc']
      ),
    };
  }, [data]);

  return (
    <div className="sider-content">
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
      <Divider />
    </div>
  );
}
