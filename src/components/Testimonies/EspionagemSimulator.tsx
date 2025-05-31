import ReactJsonView from '@microlink/react-json-view';
import { Alert, Badge, Button, Flex, InputNumber, Switch, Typography } from 'antd';
import clsx from 'clsx';
import {
  type DailyEspionagemEntry,
  useDailyEspionagemGames,
} from 'components/Daily/utils/games/daily-espionagem';
import { getToday } from 'components/Daily/utils/utils';
import { ImageCard } from 'components/Images/ImageCard';
import { getSuspectImageId } from 'components/Suspects/utils';
import { useMemo, useRef, useState } from 'react';

export function EspionagemSimulator() {
  const [run, setRun] = useState({ batchSize: 1, history: {} });
  const batchSizeRef = useRef<number>(1);
  const { entries } = useDailyEspionagemGames(true, 'pt', run.batchSize, run.history);

  return (
    <Flex vertical gap={12} className="p-4">
      <Flex justify="space-between" align="center">
        <Typography.Title level={4} className="my-0">
          Espionagem Simulator
        </Typography.Title>
        <Flex gap={6}>
          <InputNumber
            min={1}
            max={7}
            defaultValue={1}
            onChange={(value) => {
              batchSizeRef.current = value ?? 1;
            }}
          />
          <Button type="primary" onClick={() => setRun({ batchSize: batchSizeRef.current, history: {} })}>
            Re-run Simulation
          </Button>
        </Flex>
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

    return entry.statements.slice(0, 3).reduce((acc: Record<string, number>, statement) => {
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
              {entry.suspects.map((suspect) => (
                <Badge.Ribbon
                  key={suspect.id}
                  text={showCulprit ? excludeCounts[suspect.id] : null}
                  color="cyan"
                >
                  <ImageCard
                    key={suspect.id}
                    id={getSuspectImageId(suspect.id, 'gb')}
                    width={96}
                    className={clsx(showCulprit && suspect.id === entry.culpritId && 'red-border')}
                  />
                  <Flex gap={6} align="center">
                    <Switch checkedChildren="🚫" size="small" /> {suspect.id}
                  </Flex>
                </Badge.Ribbon>
              ))}
            </div>
          </div>

          <div>
            <div>
              <Switch
                checkedChildren="Show Culprit"
                unCheckedChildren="Hide Culprit"
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
