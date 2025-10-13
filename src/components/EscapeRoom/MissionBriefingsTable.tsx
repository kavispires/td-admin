import { Flex, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import type { EscapeRoomCardType, MissionBriefing } from './cards/escape-room-types';

type MissionBriefingsTableProps = {
  missionBriefings: MissionBriefing[];
  cards: Dictionary<EscapeRoomCardType>;
};

export function MissionBriefingsTable({ cards, missionBriefings }: MissionBriefingsTableProps) {
  const columns: TableProps<MissionBriefing>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: 'Solution',
      dataIndex: 'solution',
      key: 'solution',
      render: (solution) => <Typography.Text>{solution.type}</Typography.Text>,
    },
  ];

  return (
    <Flex className="full-width py-1" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={5}>
          Mission Sets
        </Typography.Title>
      </Flex>
      <Table bordered className="full-width" columns={columns} dataSource={missionBriefings} rowKey="id" />
    </Flex>
  );
}
