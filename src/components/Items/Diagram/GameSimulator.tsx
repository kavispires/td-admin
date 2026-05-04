import { Button, Space, Typography } from 'antd';
import {
  buildDailyConjuntosGames,
  type DailyConjuntosEntry,
} from 'components/Daily/utils/games/daily-conjuntos';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useState } from 'react';
import { useMeasure } from 'react-use';
import type { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { DiagramGameSample } from './DiagramGameSample';
import './GameSimulator.scss';

type GameSimulatorProps = {
  things: UseResourceFirestoreDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
};

export function GameSimulator({ things, rules }: GameSimulatorProps) {
  const [ref] = useMeasure<HTMLDivElement>();

  const [simulation, setSimulation] = useState<DailyConjuntosEntry | null>(null);

  const onSimulate = () => {
    setSimulation(
      Object.values(
        buildDailyConjuntosGames(
          1,
          {
            latestDate: '2023/01/01',
            latestNumber: 0,
            used: [],
          },
          rules,
          things,
        ),
      )[0],
    );
  };

  const onGenerateDemoGames = () => {
    let demos: any = null;
    try {
      demos = buildDailyConjuntosGames(
        25,
        {
          latestDate: '2023/01/01',
          latestNumber: 0,
          used: [],
        },
        rules,
        things,
      );

      console.log(demos);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Space orientation="vertical" ref={ref}>
      <Typography.Title level={5}>Game Simulator</Typography.Title>

      <Button onClick={onSimulate} size="large">
        Simulate
      </Button>

      <Button onClick={onGenerateDemoGames} size="large">
        Generate Demos (log)
      </Button>

      {simulation && <DiagramGameSample game={simulation} key={JSON.stringify(simulation)} />}
    </Space>
  );
}
