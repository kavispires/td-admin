import { useMemo } from 'react';
import { SectionTitle } from './Common/SectionTitle';

type ArteRuimLevelsProps = {
  data: PlainObject;
};

export function ArteRuimLevels({ data }: ArteRuimLevelsProps) {
  const { level0, level1, level2, level3, level4, total } = useMemo(
    () =>
      Object.values(data).reduce(
        (acc, entry) => {
          acc[`level${entry.level}`] += 1;
          acc.total += 1;
          return acc;
        },
        {
          level0: 0,
          level1: 0,
          level2: 0,
          level3: 0,
          level4: 0,
          total: 0,
        },
      ),
    [data],
  );

  return (
    <div className="">
      <SectionTitle>Levels ({total})</SectionTitle>
      <div style={{ color: level0 > 0 ? 'red' : 'inherit' }}>Level 0: {level0}</div>
      <div>Level 1: {level1}</div>
      <div>Level 2: {level2}</div>
      <div>Level 3: {level3}</div>
      <div>Level 4: {level4}</div>
    </div>
  );
}
