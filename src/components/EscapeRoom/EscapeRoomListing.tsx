import { Button, Flex, Table, type TableColumnsType, Tag, Typography } from 'antd';
import type { EscapeRoomEpisode } from 'components/EscapeRoom/types';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { EscapeRoomResourceContextType } from './EscapeRoomFilters';
import { LanguageFlag } from 'components/Common/LanguageFlag';

function EscapeRoomListing() {
  const { data } = useOutletContext<EscapeRoomResourceContextType>();
  const navigate = useNavigate();
  const rows = useMemo(() => Object.values(data ?? {}), [data]);

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const columns: TableColumnsType<EscapeRoomEpisode> = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title-en',
      render: (title) => title,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => <LanguageFlag language={language as Language} width={16} />,
      sorter: (a, b) => a.language.localeCompare(b.language),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => total,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => difficulty,
      sorter: (a, b) => a.difficulty.localeCompare(b.difficulty),
    },
    {
      title: 'Missions',
      key: 'missions',
      dataIndex: 'missions',
      render: (missions) => <Tag>{Object.keys(missions).length}</Tag>,
    },
    {
      title: 'Cards',
      key: 'cards',
      dataIndex: 'cards',
      render: (cards) => <Tag>{Object.keys(cards).length}</Tag>,
    },
    {
      title: 'Fillers',
      key: 'fillers',
      dataIndex: 'cards',
      render: (cards: EscapeRoomEpisode['cards']) => {
        const fillers = Object.values(cards).filter((card) => card.filler);
        return <Tag>{Object.keys(fillers).length}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: EscapeRoomEpisode) => (
        <Flex gap={8}>
          <Button type="primary" onClick={() => navigate(`${record.id}`)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button danger disabled icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Ready',
      key: 'ready',
      dataIndex: 'ready',
      render: (ready: boolean) => (ready ? <Tag color="green">Ready</Tag> : <Tag color="red">Not Ready</Tag>),
    },
  ];
  return (
    <>
      <>
        <Typography.Title level={2}>Listing - All Episodes ({rows.length})</Typography.Title>

        <Table rowKey="id" dataSource={rows} columns={columns} pagination={paginationProps} />
      </>
    </>
  );
}
export default EscapeRoomListing;
