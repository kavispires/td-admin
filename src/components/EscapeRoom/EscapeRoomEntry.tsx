import { useOutletContext, useParams } from 'react-router-dom';
import type { EscapeRoomResourceContextType } from './EscapeRoomFilters';
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  Flex,
  Table,
  type TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { EscapeRoomEpisode } from './types';
import { useQueryParams } from 'hooks/useQueryParams';
import { FileAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { AllCards } from './AllCards';

function EscapeRoomEntry() {
  const { episodeId = '' } = useParams();
  const { data, addEntryToUpdate } = useOutletContext<EscapeRoomResourceContextType>();
  const episode = data[episodeId];
  const { is, addParam } = useQueryParams();

  const columns: TableColumnsType<EscapeRoomEpisode> = [
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
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => difficulty,
    },
    {
      title: 'Missions',
      key: 'missions',
      dataIndex: 'missions',
      render: (missions) => (
        <Flex gap={8}>
          <Tag>{Object.keys(missions).length}</Tag>
          <Button onClick={() => addParam('edit', 'missions')} icon={<FileAddOutlined />} size="small">
            Edit Missions
          </Button>
          {Object.keys(missions).length < 1 && <Tooltip title="At least one mission is required"></Tooltip>}
        </Flex>
      ),
    },
    {
      title: 'Cards',
      key: 'cards',
      dataIndex: 'cards',
      render: (cards) => (
        <Flex gap={8}>
          <Tag>{Object.keys(cards).length}</Tag>
          <Button onClick={() => addParam('edit', 'cards')} icon={<FileAddOutlined />} size="small">
            Edit Cards
          </Button>
        </Flex>
      ),
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
      title: 'Ready',
      key: 'ready',
      dataIndex: 'ready',
      render: (ready: boolean) => (ready ? <Tag color="green">Ready</Tag> : <Tag color="red">Not Ready</Tag>),
    },
  ];

  if (!episode) {
    return (
      <Empty
        description={
          <Alert
            message="Episode not found"
            description={`Episode ${episodeId} was not found in the database.`}
            type="error"
          />
        }
      />
    );
  }

  return (
    <div className="my-4">
      <Breadcrumb
        items={[{ title: <Link to="/game/escape-room">All Episodes</Link> }, { title: episodeId }]}
      />
      <Typography.Title level={2}>Episode {episodeId}</Typography.Title>
      <Table rowKey="id" dataSource={[episode]} columns={columns} pagination={false} />

      {/* {is('edit', 'missions') && <EditMissions />} */}
      {is('edit', 'cards') && <AllCards episode={episode} />}
    </div>
  );
}

export default EscapeRoomEntry;
