import { Button, Divider, Space, Typography } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMeasure } from 'react-use';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { AddNewThingFlow } from './AddNewThingFlow';
import { DailyTeoriaDeConjuntosEntry } from 'components/Daily/utils/types';
import { useState } from 'react';
import { buildDailyTeoriaDeConjuntosGames } from 'components/Daily/utils/games/daily-teoria-de-conjuntos';
import { DiagramGameSample } from './DiagramGameSample';

type RulesByThingProps = {
  things: UseResourceFirebaseDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  thingsByRules: Record<string, string[]>;
};

export function RulesByThing({
  things,
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
          things
        )
      )[0]
    );
  };

  return (
    <Space direction="vertical" ref={ref}>
      <Typography.Title level={5}>
        Rules By Items (Added: {Object.keys(things).length} | {availableThings.length})
      </Typography.Title>

      <AddNewThingFlow
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
