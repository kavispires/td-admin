import { CheckCircleFilled } from '@ant-design/icons';
import {
  Button,
  Input,
  Space,
  Table,
  type TableColumnsType,
  Tabs,
  type TabsProps,
  Tag,
  Typography,
} from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { cloneDeep } from 'lodash';
import type { CrimesHediondosCard } from 'types';
import { CardEditTags } from './CardEditTags';
import { CrimeItemCard } from './CrimeItemCard';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

export function CrimeTableContent({
  rows,
  allTags,
  onUpdateCard,
  weapons,
  evidence,
  locations,
  victims,
}: CrimesHediondosInnerContentProps & {
  weapons: CrimesHediondosCard[];
  evidence: CrimesHediondosCard[];
  locations: CrimesHediondosCard[];
  victims: CrimesHediondosCard[];
}) {
  const { queryParams, addParams } = useQueryParams();
  const type = queryParams.get('type');

  const tabs: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All',
      children: <CrimeTable rows={rows} allTags={allTags} onUpdateCard={onUpdateCard} />,
    },
    {
      key: 'weapons',
      label: 'Weapons',
      children: <CrimeTable rows={weapons} allTags={allTags} onUpdateCard={onUpdateCard} />,
    },
    {
      key: 'evidence',
      label: 'Evidence',
      children: <CrimeTable rows={evidence} allTags={allTags} onUpdateCard={onUpdateCard} />,
    },
    {
      key: 'locations',
      label: 'Locations',
      children: <CrimeTable rows={locations} allTags={allTags} onUpdateCard={onUpdateCard} />,
    },
    {
      key: 'victims',
      label: 'Victims',
      children: <CrimeTable rows={victims} allTags={allTags} onUpdateCard={onUpdateCard} />,
    },
  ];

  const onChangeTab = (key: string) => {
    addParams({ type: key, page: '1' });
  };

  return (
    <div className="my-4">
      <Tabs defaultActiveKey={type || 'all'} items={tabs} onChange={onChangeTab} />
    </div>
  );
}

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
        <Typography>{rows.length} cards total</Typography>
        <Button
          onClick={() => {
            onCopyToClipboard(allTags.map((tag) => tag.value).join(', '));
          }}
        >
          Copy All Tags
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
