import { EditOutlined } from '@ant-design/icons';
import { Button, Table, type TableProps, Tag } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTablePagination } from 'hooks/useTablePagination';
import type { ImageCardDescriptor } from 'types';
import { ImageCard } from '../ImageCard';
import { FavoriteImageCardButton } from './ImageCardsDescriptorModal';

export function ImageCardsDescriptorTable({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
  const { addParam } = useQueryParams();

  const columns: TableProps<ImageCardDescriptor>['columns'] = [
    {
      title: 'CardId',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Image',
      dataIndex: 'id',
      key: 'image',
      render: (id: string) => (
        <Button onClick={() => addParam('cardId', id)} style={{ padding: 0, height: 'auto' }} type="link">
          <ImageCard cardId={id} cardWidth={50} preview={false} />
        </Button>
      ),
    },
    {
      title: 'Favorite',
      dataIndex: 'favorite',
      key: 'favorite',
      sorter: (a, b) => (a.favorite ? 1 : 0) - (b.favorite ? 1 : 0),
      render: (_, record) => (
        <FavoriteImageCardButton addEntryToUpdate={addEntryToUpdate} imageCard={record} />
      ),
    },
    {
      title: 'Title (EN)',
      dataIndex: ['title', 'en'],
      key: 'title-en',
      sorter: (a, b) => (a.title?.en || '').localeCompare(b.title?.en || ''),
      render: (titleEn: string) => titleEn || '-',
    },
    {
      title: 'Title (PT)',
      dataIndex: ['title', 'pt'],
      key: 'title-pt',
      sorter: (a, b) => (a.title?.pt || '').localeCompare(b.title?.pt || ''),
      render: (titlePt: string) => titlePt || '-',
    },
    {
      title: 'Keywords',
      dataIndex: 'keywords',
      key: 'keywords',
      sorter: (a, b) => (a.keywords?.length || 0) - (b.keywords?.length || 0),
      render: (keywords: string[]) => (
        <>
          {keywords?.join(', ') || ''}
          {keywords?.length > 0 && <Tag style={{ marginLeft: 8 }}>{keywords.length}</Tag>}
        </>
      ),
    },
    {
      title: 'Triggers',
      dataIndex: 'triggers',
      key: 'triggers',
      sorter: (a, b) => (a.triggers?.length || 0) - (b.triggers?.length || 0),
      render: (triggers: string[]) => triggers?.join(', '),
    },
    {
      title: 'Associated Dreams',
      dataIndex: 'associatedDreams',
      key: 'associatedDreams',
      sorter: (a, b) => (a.associatedDreams?.length || 0) - (b.associatedDreams?.length || 0),
      render: (associatedDreams: string[]) => (
        <>
          {associatedDreams?.join(', ') || '-'}
          {associatedDreams?.length > 0 && <Tag style={{ marginLeft: 8 }}>{associatedDreams.length}</Tag>}
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => addParam('cardId', record.id)}>
          Edit
        </Button>
      ),
    },
  ];

  const rows = Object.values(data);

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  return <Table columns={columns} dataSource={rows} pagination={paginationProps} rowKey="id" />;
}
