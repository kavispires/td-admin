import { Button, Input, Space, Table, TableColumnsType, Tag } from 'antd';
import { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';
import { CrimesHediondosCard } from 'types';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { CrimeItemCard } from './CrimeItemCard';
import { CheckCircleFilled } from '@ant-design/icons';
import { useTablePagination } from 'hooks/useTablePagination';
import { CardEditTags } from './CardEditTags';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { Name } from 'components/Common/Name';

export function CrimeTable({
  rows,
  allTags,
  addEvidenceToUpdate,
  addWeaponToUpdate,
}: CrimesHediondosInnerContentProps) {
  const onCopyToClipboard = useCopyToClipboardFunction();
  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const onUpdateCard = (card: CrimesHediondosCard) => {
    if (card.type === 'weapon') {
      addWeaponToUpdate(card.id, card);
    } else if (card.type === 'evidence') {
      addEvidenceToUpdate(card.id, card);
    } else {
      throw new Error('Invalid card type');
    }
  };

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
          <Name
            name={name}
            language="en"
            onPressEnter={(e: any) => editName(e.target?.value || record.name.en, 'en', record)}
          />
          <Name
            name={name}
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
        <Space size="small">
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
      </Space>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        expandable={{
          expandedRowKeys,
          expandedRowRender: (record) => (
            <CardEditTags
              card={record}
              allTags={allTags}
              addEvidenceToUpdate={addEvidenceToUpdate}
              addWeaponToUpdate={addWeaponToUpdate}
            />
          ),
          rowExpandable: () => true,
          defaultExpandAllRows: false,
          onExpand: (e, r) => setExpandedRowKeys(e ? [r.id] : []),
        }}
        pagination={paginationProps}
      />
    </div>
  );
}
