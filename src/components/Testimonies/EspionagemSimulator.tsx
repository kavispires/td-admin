import ReactJsonView from '@microlink/react-json-view';
import { Alert, Badge, Button, Flex, Switch, Typography } from 'antd';
import clsx from 'clsx';
import {
  type DailyEspionagemEntry,
  useDailyEspionagemGames,
} from 'components/Daily/utils/games/daily-espionagem';
import { getToday } from 'components/Daily/utils/utils';
import { ImageCard } from 'components/Images/ImageCard';
import { getSuspectImageId } from 'components/Suspects/utils';
import { useMemo, useState } from 'react';

export function EspionagemSimulator() {
  const [run, setRun] = useState({});
  const { entries } = useDailyEspionagemGames(true, 'pt', 1, run);

  return (
    <Flex vertical gap={12} className="p-4">
      <Flex justify="space-between" align="center">
        <Typography.Title level={4} className="my-0">
          Espionagem Simulator
        </Typography.Title>
        <Button type="primary" onClick={() => setRun({})}>
          Re-run Simulation
        </Button>
      </Flex>
      <SimulationGame entries={entries} />
    </Flex>
  );
}

type SimulationGameProps = {
  entries: Dictionary<DailyEspionagemEntry>;
};

function SimulationGame({ entries }: SimulationGameProps) {
  const [showCulprit, setShowCulprit] = useState(false);
  const date = getToday();
  const entry = entries[date];
  const excludeCounts = useMemo(() => {
    if (!entry) {
      return {};
    }
    return entry.statements.reduce((acc: Record<string, number>, statement) => {
      const { excludes } = statement;
      excludes.forEach((exclusion) => {
        if (acc[exclusion]) {
          acc[exclusion]++;
        } else {
          acc[exclusion] = 1;
        }
      });
      return acc;
    }, {});
  }, [entry]);

  return (
    <div className="full-width grid grid-2">
      <ReactJsonView src={entries ?? {}} theme="twilight" collapsed={3} />
      {entry && (
        <Flex gap={18} className="p-4">
          <div>
            <div
              style={{
                width: `${105 * 3}px`,
                display: 'grid',
                gap: '6px',
                gridTemplateColumns: 'repeat(3, 1fr)',
              }}
            >
              {entry.suspectsIds.map((suspectId) => (
                <Badge.Ribbon
                  key={suspectId}
                  text={showCulprit ? excludeCounts[suspectId] : null}
                  color="cyan"
                >
                  <ImageCard
                    key={suspectId}
                    id={getSuspectImageId(suspectId, 'gb')}
                    width={96}
                    className={clsx(showCulprit && suspectId === entry.culpritId && 'red-border')}
                  />
                </Badge.Ribbon>
              ))}
            </div>
          </div>

          <div>
            <div>
              <Switch
                checkedChildren="Show culprit"
                unCheckedChildren="Hide culprit"
                checked={showCulprit}
                onChange={setShowCulprit}
              />
            </div>
            {entry.statements.map((statement, index) => (
              <Typography.Paragraph key={statement.key}>
                <Badge count={statement.excludes.length} color="cyan">
                  <Alert
                    key={statement.key}
                    message={statement.text}
                    banner
                    type={index < 3 ? 'info' : 'error'}
                  />
                </Badge>
              </Typography.Paragraph>
            ))}
          </div>
        </Flex>
      )}
    </div>
  );
}
