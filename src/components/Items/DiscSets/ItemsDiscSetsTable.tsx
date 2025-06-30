import type { TableProps } from 'antd';
import { Table } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { useTDResource } from 'hooks/useTDResource';
import type { DailyDiscSet, Item as ItemT } from 'types';
import { removeDuplicates, sortItemsIds } from 'utils';
import { DiscEditableTitleCell } from './DiscEditableTitleCell';
import { DiscItemsCell } from './DiscItemsCell';
import { ItemsDiscSetExpandedRow } from './ItemsDiscSetExpandedRow';

type ItemsDiscSetsTableProps = {
  rows: DailyDiscSet[];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function ItemsDiscSetsTable({ rows, addEntryToUpdate }: ItemsDiscSetsTableProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const copyToClipboard = useCopyToClipboardFunction();

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const columns: TableProps<DailyDiscSet>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.title.en.localeCompare(b.title.en),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.en.localeCompare(b.title.en),
      render: (title, record) => (
        <DiscEditableTitleCell value={title} disc={record} addEntryToUpdate={addEntryToUpdate} />
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <DiscItemsCell
          disc={record}
          itemsIds={sortItemsIds(itemsIds)}
          copyToClipboard={copyToClipboard}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
  ];

  const expandableProps = useTableExpandableRows<DailyDiscSet>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <ItemsDiscSetExpandedRow disc={record} addEntryToUpdate={addEntryToUpdate} />
    ),
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <Table
      columns={columns}
      dataSource={rows}
      pagination={paginationProps}
      rowKey="id"
      expandable={expandableProps}
    />
  );
}
