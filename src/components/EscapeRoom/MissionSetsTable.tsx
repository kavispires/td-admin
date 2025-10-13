import { Flex, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import type { UseEscapeRoomResourceReturnType } from 'pages/EscapeRoom/useEscapeRoomResource';
import type { EscapeRoomSet } from './cards/escape-room-types';
import { MissionBriefingsTable } from './MissionBriefingsTable';

export function MissionSetsTable({
  isLoading,
  missionSets,
  cards,
  isSuccess,
}: UseEscapeRoomResourceReturnType) {
  const paginationProps = useTablePagination({ total: missionSets.length, showQuickJumper: true });

  const columns: TableProps<EscapeRoomSet>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Description',
      dataIndex: 'doc',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      sorter: (a, b) =>
        ['basic', 'medium', 'complex'].indexOf(a.difficulty) -
        ['basic', 'medium', 'complex'].indexOf(b.difficulty),
    },
    {
      title: 'Missions',
      dataIndex: 'missions',
      key: 'missions',
      render: (missions) => missions.length,
      sorter: (a, b) => a.missions.length - b.missions.length,
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: 'Ready',
      dataIndex: 'ready',
      key: 'ready',
      render: (ready) => (ready ? 'Yes' : 'No'),
      sorter: (a, b) => Number(a.ready) - Number(b.ready),
    },
  ];

  const expandableProps = useTableExpandableRows<EscapeRoomSet>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <MissionBriefingsTable cards={cards} missionBriefings={record.missions} />,
    rowExpandable: () => isSuccess,
  });

  return (
    <Flex className="full-width py-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          Mission Sets
        </Typography.Title>
        {/* <Switch
          checked={queryParams.get('sortSuspectsBy') === 'answers'}
          checkedChildren="Sort by Answers"
          onChange={(checked) => addParam('sortSuspectsBy', checked ? 'answers' : 'id')}
          unCheckedChildren="Sort by Id"
        /> */}
      </Flex>
      <Table
        bordered
        className="full-width"
        columns={columns}
        dataSource={missionSets}
        expandable={expandableProps}
        loading={isLoading}
        pagination={paginationProps}
        rowKey="id"
      />
    </Flex>
  );
}
