import { Divider, Flex, Space, Table, type TableColumnsType, Tag, Tooltip, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo } from 'react';
import { useMeasure } from 'react-use';
import type { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { AddNewThingFlow } from './AddNewThingFlow';
import { ThingButton } from './Thing';

type RulesByThingProps = {
  things: UseResourceFirestoreDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  thingsByRules: Record<string, string[]>;
  setActiveThing: React.Dispatch<React.SetStateAction<DailyDiagramItem | null>>;
};

export function RulesByThing({
  things,
  addEntryToUpdate,
  availableThings,
  rules,
  setActiveThing,
}: RulesByThingProps) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const rows = useMemo(() => Object.values(things), [things]);

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const columns: TableColumnsType<DailyDiagramItem> = [
    {
      title: 'ItemId',
      dataIndex: 'itemId',
      key: 'itemId',
      sorter: (a, b) => Number(a.itemId) - Number(b.itemId),
      render: (itemId: string) => <Tag>{itemId}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Typography.Text>{name}</Typography.Text>,
    },
    {
      title: 'Sprite',
      dataIndex: 'itemId',
      key: 'sprite',
      render: (itemId: string) => (
        <ThingButton key={`i-${itemId}`} thing={things[itemId]} onActivateThing={setActiveThing} />
      ),
    },
    {
      title: 'Rules',
      dataIndex: 'rules',
      key: 'rules',
      render: (itemRules: string[], record) => (
        <Space wrap>
          {itemRules.map((ruleId) => (
            <Tooltip title={rules[ruleId].title} key={ruleId}>
              <Tag color={rules[ruleId].updatedAt > record.updatedAt ? 'red' : undefined}>{ruleId}</Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'rules',
      key: 'count',
      sorter: (a, b) => a.rules.length - b.rules.length,
      render: (rules: string[]) => rules.length,
    },
  ];

  const duplicatedThings = useMemo(() => {
    const dict: Dictionary<string[]> = {};

    Object.values(things).forEach((item) => {
      if (!dict[item.name]) {
        dict[item.name] = [];
      }
      dict[item.name].push(item.itemId);
    });
    return Object.values(dict).filter((ids) => ids.length > 1);
  }, [things]);

  return (
    <Space direction="vertical" ref={ref}>
      <Typography.Title level={5}>
        Rules By Items <Divider type="vertical" /> Added: <Tag>{Object.keys(things).length}</Tag> Available to
        add <Tag>{availableThings.length}</Tag>
      </Typography.Title>

      <AddNewThingFlow
        addEntryToUpdate={addEntryToUpdate}
        availableThings={availableThings}
        rules={rules}
        width={containerWidth}
      />

      <Divider />

      <Table dataSource={rows} columns={columns} rowKey="itemId" pagination={paginationProps} />

      <Divider />

      <Typography.Title level={5}>Duplicated Things</Typography.Title>
      <Space wrap>
        {duplicatedThings.length === 0 && <Typography.Text>No duplicated things</Typography.Text>}
        {duplicatedThings.map((ids) => (
          <Flex key={ids[0]} align="center">
            <Tag color="red">{ids.length}</Tag>
            {ids.map((itemId) => (
              <ThingButton key={`i-${itemId}`} thing={things[itemId]} onActivateThing={setActiveThing} />
            ))}
          </Flex>
        ))}
      </Space>
    </Space>
  );
}
