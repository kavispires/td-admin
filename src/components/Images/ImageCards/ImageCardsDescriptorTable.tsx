import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Table, type TableProps } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTablePagination } from 'hooks/useTablePagination';
import type { ImageCardDescriptor } from 'types';
import { ImageCard } from '../ImageCard';
import { FavoriteImageCardButton } from './ImageCardsDescriptorModal';

export function ImageCardsDescriptorTable({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<ImageCardDescriptor>) {
  const { addParam } = useQueryParams();

  const columns: TableProps<ImageCardDescriptor>['columns'] = [
    {
      title: 'CardId',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: 'Image',
      dataIndex: 'id',
      key: 'image',
      render: (id: string) => <ImageCard id={id} width={50} />,
    },
    {
      title: 'Keywords',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => keywords?.join(', '),
    },
    {
      title: 'Triggers',
      dataIndex: 'triggers',
      key: 'triggers',
      render: (triggers: string[]) => triggers?.join(', '),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex>
          <FavoriteImageCardButton imageCard={record} addEntryToUpdate={addEntryToUpdate} />
          <Button icon={<EditOutlined />} onClick={() => addParam('cardId', record.id)}>
            Edit
          </Button>
        </Flex>
      ),
    },
  ];

  const rows = Object.values(data);

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  return <Table dataSource={rows} columns={columns} rowKey="id" pagination={paginationProps} />;
}
