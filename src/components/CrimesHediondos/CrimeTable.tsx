import { Space, Table, TableColumnsType, Tag } from 'antd';
import { CrimesHediondosContentProps } from './CrimesHediondosContent';
import { useMemo } from 'react';
import { CrimesHediondosCard } from 'types';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { CrimeItemCard } from './CrimeItemCard';

export function CrimeTable({ weaponsQuery, evidenceQuery }: CrimesHediondosContentProps) {
  const rows = useMemo(() => {
    return [...Object.values(weaponsQuery.data), ...Object.values(evidenceQuery.data)];
  }, [weaponsQuery.data, evidenceQuery.data]);

  const columns: TableColumnsType<CrimesHediondosCard> = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <span>
          {id}
          <CopyToClipboardButton content={id} />
        </span>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Card',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (_, record) => (
        <div>
          <CrimeItemCard item={record} cardWidth={70} />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.en.localeCompare(b.name.en),
      render: (name) => (
        <Space direction="vertical">
          <span>{name.en}</span>
          <span>{name.pt}</span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <span>{type}</span>,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size="small">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={rows} />
    </div>
  );
}
