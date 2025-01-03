import { Space, Table, type TableColumnsType } from 'antd';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { CrimesHediondosCard } from 'types';
import { CrimeItemCard } from './CrimeItemCard';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';
import { EditCrimeCardModal } from './EditCrimeCardModal';

type TagGroup = {
  id: string;
  tag: string;
  count: number;
  cardsIds: string[];
};

type TagsTableProps = {
  rows: CrimesHediondosCard[];
  weapons: UseResourceFirebaseDataReturnType<CrimesHediondosCard>['data'];
  evidence: UseResourceFirebaseDataReturnType<CrimesHediondosCard>['data'];
  onUpdateCard: (card: CrimesHediondosCard) => void;
  allTags: CrimesHediondosInnerContentProps['allTags'];
};

export function TagsTable({ rows, weapons, evidence, onUpdateCard, allTags }: TagsTableProps) {
  const tags = useMemo(() => {
    const dict: Record<string, TagGroup> = {};

    rows.forEach((row) => {
      row.tags?.forEach((tag) => {
        if (!dict[tag]) {
          dict[tag] = { id: tag, tag, count: 0, cardsIds: [] };
        }
        dict[tag].count++;
        dict[tag].cardsIds.push(row.id);
      });
    });

    return orderBy(Object.values(dict), ['tag'], ['asc']);
  }, [rows]);

  const paginationProps = useTablePagination({ total: tags.length, showQuickJumper: true });
  const expandableProps = useTableExpandableRows<TagGroup>({
    maxExpandedRows: 1,
    expandRowByClick: true,
    expandedRowRender: (record) => (
      <Space size="small" wrap>
        {record.cardsIds.map((id) => {
          const card: CrimesHediondosCard = weapons[id] ?? evidence[id];
          return (
            <Space key={id} direction="vertical" align="center">
              <CrimeItemCard item={card} cardWidth={75} />
              <EditCrimeCardModal allTags={allTags} onUpdateCard={onUpdateCard} card={card} />
            </Space>
          );
        })}
      </Space>
    ),
  });

  const columns: TableColumnsType<TagGroup> = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <span>{id}</span>,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      render: (tag: string) => <span>{tag}</span>,
      sorter: (a, b) => a.tag.localeCompare(b.tag),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => <span>{count}</span>,
      sorter: (a, b) => a.count - b.count,
    },
  ];

  return (
    <div className="my-4">
      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        expandable={expandableProps}
        pagination={paginationProps}
      />
    </div>
  );
}
