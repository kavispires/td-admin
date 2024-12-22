import { Button, Input, Space, Table, type TableColumnsType, Tag } from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { cloneDeep } from 'lodash';
import type { CrimesHediondosCard } from 'types';

import { CheckCircleFilled } from '@ant-design/icons';

import { CardEditTags } from './CardEditTags';
import { CrimeItemCard } from './CrimeItemCard';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

export function CrimeTable({ rows, allTags, onUpdateCard }: CrimesHediondosInnerContentProps) {
  const onCopyToClipboard = useCopyToClipboardFunction();
  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const editName = (name: string, language: 'pt' | 'en', card: CrimesHediondosCard) => {
    const copy = cloneDeep(card);
    copy.name[language] = name;
    onUpdateCard(copy);
  };

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
          <Input
            defaultValue={record.itemId}
            size="small"
            onBlur={(e) => {
              console.log(e?.target?.value);
              console.log('onBlur');
              if (e?.target?.value && e?.target?.value !== record.itemId) {
                const copy = cloneDeep(record);
                copy.itemId = e?.target?.value;
                onUpdateCard(copy);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.en.localeCompare(b.name.en),
      render: (name, record) => (
        <Space direction="vertical" style={{ minWidth: 150 }}>
          <DualLanguageTextField
            value={name}
            language="en"
            onPressEnter={(e: any) => editName(e.target?.value || record.name.en, 'en', record)}
          />
          <DualLanguageTextField
            value={name}
            language="pt"
            onPressEnter={(e: any) => editName(e.target?.value || record.name.pt, 'pt', record)}
          />
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
    Table.EXPAND_COLUMN,
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size="small" wrap>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Verify',
      dataIndex: 'tags',
      key: 'verify',
      render: (tags: string[]) => (tags.length > 2 ? <CheckCircleFilled /> : ''),
    },
  ];

  const expandableProps = useTableExpandableRows<CrimesHediondosCard>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <CardEditTags card={record} allTags={allTags} onUpdateCard={onUpdateCard} />
    ),
  });

  const onCopyPageCards = () => {
    if (paginationProps) {
      const { current = 1, pageSize = 10 } = paginationProps;
      const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

      const result: string[] = [];

      pageRows.forEach((row, index) => {
        result.push(`${index + 1}) ${row.name.en} - Current tags: ${(row.tags ?? []).join(', ')}`);
      });
      console.log(result);
      onCopyToClipboard(result.join('\n'));
    }
  };

  return (
    <div className="my-4">
      <Space className="mb-4">
        <Button
          onClick={() => {
            onCopyToClipboard(allTags.map((tag) => tag.value).join(', '));
          }}
        >
          Copy AllTags
        </Button>
        <Button onClick={onCopyPageCards}>Copy Page Cards</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        expandable={expandableProps}
        pagination={paginationProps}
      />
    </div>
  );
}
