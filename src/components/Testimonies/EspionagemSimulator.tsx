import { AppstoreFilled, AudioFilled, SkinFilled } from '@ant-design/icons';
import ReactJsonView from '@microlink/react-json-view';
import { Alert, Badge, Button, Flex, InputNumber, Switch, Typography } from 'antd';
import clsx from 'clsx';
import {
  type DailyEspionagemEntry,
  useDailyEspionagemGames,
} from 'components/Daily/utils/games/daily-espionagem';
import { getToday } from 'components/Daily/utils/utils';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import type { SuspectCard } from 'types';

export function EspionagemSimulator() {
  const [run, setRun] = useState({ batchSize: 1, history: {} });
  const batchSizeRef = useRef<number>(1);
  const { entries } = useDailyEspionagemGames(true, 'pt', run.batchSize, run.history);
  const suspectsQuery = useTDResource<SuspectCard>('suspects', !isEmpty(entries));

  console.log(countSuspectUse(entries, suspectsQuery.data ?? {}));

  return (
    <Flex className="p-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          Espionagem Simulator
        </Typography.Title>
        <Flex gap={6}>
          <InputNumber
            defaultValue={1}
            max={100}
            min={1}
            onChange={(value) => {
              batchSizeRef.current = value ?? 1;
            }}
          />
          <Button onClick={() => setRun({ batchSize: batchSizeRef.current, history: {} })} type="primary">
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
    <div className="full-width grid" style={{ gridTemplateColumns: '2fr 3fr' }}>
      <ReactJsonView collapsed={3} src={entries ?? {}} theme="twilight" />
      <div>
        {entry && (
          <Flex className="p-4" gap={18}>
            <div>
              <div
                style={{
                  width: `${105 * 4}px`,
                  display: 'grid',
                  gap: '6px',

                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {entry.suspects.map((suspect) => (
                  <Badge.Ribbon
                    color="cyan"
                    key={suspect.id}
                    text={showCulprit ? excludeCounts[suspect.id] : null}
                  >
                    <SuspectImageCard
                      className={clsx(showCulprit && suspect.id === entry.culpritId && 'red-border')}
                      id={suspect.id}
                      key={suspect.id}
                      width={96}
                    />
                    <Flex align="center" gap={6}>
                      <Switch checkedChildren="🚫" size="small" /> {suspect.id}
                    </Flex>
                  </Badge.Ribbon>
                ))}
              </div>
            </div>

            <div>
              <div>
                <Switch
                  checked={showCulprit}
                  checkedChildren="Show Culprit"
                  onChange={setShowCulprit}
                  unCheckedChildren="Hide Culprit"
                />
              </div>
              {entry.statements.map((statement) => (
                <Typography.Paragraph key={statement.key}>
                  <Badge color="cyan" count={statement.excludes.length}>
                    <Alert
                      banner
                      icon={getStatementIcon(statement.type)}
                      key={statement.key}
                      message={statement.text}
                      type="info"
                    />
                  </Badge>
                </Typography.Paragraph>
              ))}
              {entry.additionalStatements.map((statement) => (
                <Typography.Paragraph key={statement.key}>
                  <Badge color="cyan" count={statement.excludes.length}>
                    <Alert
                      banner
                      icon={getStatementIcon(statement.type)}
                      key={statement.key}
                      message={statement.text}
                      type="warning"
                    />
                  </Badge>
                </Typography.Paragraph>
              ))}
            </div>
          </Flex>
        )}
      </div>
    </div>
  );
}

const getStatementIcon = (type: DailyEspionagemEntry['statements'][number]['type']) => {
  switch (type) {
    case 'testimony':
      return <AudioFilled />;
    case 'feature':
      return <SkinFilled />;
    case 'grid':
      return <AppstoreFilled />;
    default:
      return '❓';
  }
};

const countSuspectUse = (entries: Dictionary<DailyEspionagemEntry>, suspects: Dictionary<SuspectCard>) => {
  // Calculate how many times each suspect is used in the entries, and now many times they are the culprit
  const suspectUsage = Object.values(entries).reduce(
    (acc: Record<string, number>, entry) => {
      entry.suspects.forEach((suspect) => {
        acc[suspect.id] = (acc[suspect.id] || 0) + 1;
        if (suspect.id === entry.culpritId) {
          acc[`${suspect.id}_culprit`] = (acc[`${suspect.id}_culprit`] || 0) + 1;
        }
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  // Also add suspects that are not used in the entries
  Object.values(suspects).forEach((suspect) => {
    if (!suspectUsage[suspect.id]) {
      suspectUsage[suspect.id] = 0;
    }
    if (!suspectUsage[`${suspect.id}_culprit`]) {
      suspectUsage[`${suspect.id}_culprit`] = 0;
    }
  });
  return suspectUsage;
};
