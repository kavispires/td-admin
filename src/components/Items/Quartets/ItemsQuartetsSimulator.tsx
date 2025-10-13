import ReactJsonView from '@microlink/react-json-view';
import { Button, Flex, InputNumber, Space, Typography } from 'antd';
import {
  type DailyQuartetosEntry,
  useDailyQuartetosGames,
} from 'components/Daily/utils/games/daily-quartetos';
import { getToday } from 'components/Daily/utils/utils';
import { Item } from 'components/Sprites';
import { useRef, useState } from 'react';
import type { DailyQuartetSet } from 'types';

export function ItemsQuartetsSimulator() {
  const [run, setRun] = useState({ batchSize: 1, history: {} });
  const batchSizeRef = useRef<number>(1);
  const { entries } = useDailyQuartetosGames(true, 'pt', run.batchSize, run.history);

  return (
    <Flex className="p-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          Quartetos Simulator
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
  entries: Dictionary<DailyQuartetosEntry>;
};

function SimulationGame({ entries }: SimulationGameProps) {
  const date = getToday();
  const entry = entries[date];

  return (
    <div className="full-width grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <ReactJsonView collapsed={3} src={entries ?? {}} theme="twilight" />
      <div>
        {entry && (
          <Flex vertical>
            {entry.sets.map((quartet) => (
              <QuartetRow key={quartet.id} quartet={quartet} />
            ))}
          </Flex>
        )}
      </div>
    </div>
  );
}

type QuartetRowProps = {
  quartet: DailyQuartetSet;
};

function QuartetRow({ quartet }: QuartetRowProps) {
  return (
    <Space direction="vertical">
      <Typography.Text strong>
        {quartet.title} [{quartet.level}]
      </Typography.Text>
      <Flex gap={8}>
        {quartet.itemsIds.map((itemId) => (
          <Flex key={itemId} vertical>
            <Item itemId={itemId} width={60} />
            <Typography.Text type="secondary">{itemId}</Typography.Text>
          </Flex>
        ))}
      </Flex>
    </Space>
  );
}
