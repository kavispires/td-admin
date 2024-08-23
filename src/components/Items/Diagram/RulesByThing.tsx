import { Button, Divider, Space, Typography } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMeasure } from 'react-use';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { AddItemRules } from './AddItemRules';
import { DailyTeoriaDeConjuntosEntry } from 'components/Daily/utils/types';
import { useState } from 'react';
import { buildDailyTeoriaDeConjuntosGames } from 'components/Daily/utils/games/daily-teoria-de-conjuntos';
import { DiagramGameSample } from './DiagramGameSample';

type RulesByThingProps = {
  data: UseResourceFirebaseDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  thingsByRules: Record<string, string[]>;
};

export function RulesByThing({
  data,
  addEntryToUpdate,
  availableThings,
  rules,
  thingsByRules,
}: RulesByThingProps) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const [simulation, setSimulation] = useState<DailyTeoriaDeConjuntosEntry | null>(null);

  const onSimulate = () => {
    setSimulation(
      Object.values(
        buildDailyTeoriaDeConjuntosGames(
          1,
          {
            latestDate: '2023/01/01',
            latestNumber: 0,
            used: [],
          },
          rules,
          data
        )
      )[0]
    );
  };

  return (
    <Space direction="vertical" ref={ref}>
      <Typography.Title level={5}>
        Rules By Items (Added: {Object.keys(data).length} | {availableThings.length})
      </Typography.Title>

      <AddItemRules
        addEntryToUpdate={addEntryToUpdate}
        availableThings={availableThings}
        rules={rules}
        width={containerWidth}
      />

      <Divider />

      <Button size="large" onClick={onSimulate}>
        Simulate
      </Button>

      {simulation && <DiagramGameSample game={simulation} />}
    </Space>
  );
}
