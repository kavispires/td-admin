import { Divider, Rate, Space, Table, TableColumnsType, Tag, Typography } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo } from 'react';
import { useMeasure } from 'react-use';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';

import { AddNewThingFlow } from './AddNewThingFlow';
import { Thing } from './Thing';

type ThingsByRuleProps = {
  things: UseResourceFirebaseDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  thingsByRules: Record<string, string[]>;
};

export function ThingsByRule({
  things,
  addEntryToUpdate,
  availableThings,
  rules,
  thingsByRules,
}: ThingsByRuleProps) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const rows = useMemo(
    () =>
      Object.values(rules).map((r) => ({
        ...r,
        thingsCount: thingsByRules[r.id].length,
      })),
    [rules, thingsByRules]
  );

  const stats = useMemo(() => {
    const quantities = Object.values(thingsByRules).map((things) => things.length);

    return {
      maxThings: Math.max(...quantities),
      minThings: Math.min(...quantities),
      averageThings: Math.round(
        Object.values(thingsByRules).reduce((sum, things) => sum + things.length, 0) /
          Object.keys(thingsByRules).length
      ),
    };
  }, [thingsByRules]);

  const columns: TableColumnsType<DailyDiagramRule & { thingsCount: number }> = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]),
      render: (title: string) => <Typography.Text>{title}</Typography.Text>,
    },
    {
      title: 'Rule',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string) => <Typography.Text>{title}</Typography.Text>,
    },
    {
      title: 'Things',
      dataIndex: 'thingsCount',
      key: 'thingsCount',
      render: (thingsCount: number, record) => (
        <Space size="small">
          <Tag>{thingsCount}</Tag>
          <Space size="small" wrap>
            {thingsByRules[record.id].slice(0, 20).map((itemId) => (
              <Thing key={`${record.id}-${itemId}`} itemId={itemId} name={things[itemId].name} />
            ))}
            {thingsByRules[record.id].length > 20 && (
              <Typography.Text>+{thingsCount - 20} more</Typography.Text>
            )}
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.thingsCount - b.thingsCount,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: (a, b) => a.level - b.level,
      render: (level: number) => <Rate value={level} count={3} disabled />,
    },
  ];

  return (
    <Space direction="vertical" ref={ref}>
      <Typography.Title level={4}>
        Things By Rule (Added: {Object.keys(things).length} | {availableThings.length})
      </Typography.Title>

      <Space split={<Divider type="vertical" />}>
        <AddNewThingFlow
          addEntryToUpdate={addEntryToUpdate}
          availableThings={availableThings}
          rules={rules}
          width={containerWidth}
        />

        <Typography.Text strong>
          Average Things: <Tag>{stats.averageThings}</Tag>
        </Typography.Text>

        <Typography.Text strong>
          Max Things: <Tag>{stats.maxThings}</Tag>
        </Typography.Text>

        <Typography.Text strong>
          Min Things: <Tag>{stats.minThings}</Tag>
        </Typography.Text>
      </Space>

      <Table dataSource={rows} columns={columns} />
    </Space>
  );
}
