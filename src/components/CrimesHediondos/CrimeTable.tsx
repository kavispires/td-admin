import {
  Button,
  Flex,
  Input,
  Space,
  Table,
  type TableColumnsType,
  Tabs,
  type TabsProps,
  Typography,
} from 'antd';
import clsx from 'clsx';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { cloneDeep } from 'lodash';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { CrimeItemCard } from './CrimeItemCard';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

export function CrimeTableContent({
  rows,
  onUpdateCard,
  weapons,
  evidence,
  locations,
  victims,
  scenes,
}: CrimesHediondosInnerContentProps & {
  weapons: CrimesHediondosCard[];
  evidence: CrimesHediondosCard[];
  locations: CrimesHediondosCard[];
  victims: CrimesHediondosCard[];
  scenes: Dictionary<CrimeSceneTile>;
}) {
  const { queryParams, addParams } = useQueryParams();
  const type = queryParams.get('type');

  const tabs: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All',
      children: <CrimeTable rows={rows} onUpdateCard={onUpdateCard} scenes={scenes} />,
    },
    {
      key: 'weapons',
      label: 'Weapons',
      children: <CrimeTable rows={weapons} onUpdateCard={onUpdateCard} scenes={scenes} />,
    },
    {
      key: 'evidence',
      label: 'Evidence',
      children: <CrimeTable rows={evidence} onUpdateCard={onUpdateCard} scenes={scenes} />,
    },
    {
      key: 'locations',
      label: 'Locations',
      children: <CrimeTable rows={locations} onUpdateCard={onUpdateCard} scenes={scenes} />,
    },
    {
      key: 'victims',
      label: 'Victims',
      children: <CrimeTable rows={victims} onUpdateCard={onUpdateCard} scenes={scenes} />,
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

export function CrimeTable({
  rows,
  onUpdateCard,
  scenes,
}: CrimesHediondosInnerContentProps & { scenes: Dictionary<CrimeSceneTile> }) {
  const onCopyToClipboard = useCopyToClipboardFunction();
  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const editName = (name: string, language: 'pt' | 'en', card: CrimesHediondosCard) => {
    const copy = cloneDeep(card);
    copy.name[language] = name;
    onUpdateCard(copy);
  };

  const columns: TableColumnsType<CrimesHediondosCard> = [
    Table.EXPAND_COLUMN,
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
        <Flex align="center" gap={8}>
          <CrimeItemCard item={record} cardWidth={70} />
          <div>
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
        </Flex>
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
  ];

  const expandableProps = useTableExpandableRows<CrimesHediondosCard>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <CardSceneLikelihood card={record} scenes={scenes} />,
  });

  const onCopyPageCards = () => {
    if (paginationProps) {
      const { current = 1, pageSize = 10 } = paginationProps;
      const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

      const result: string[] = [];

      pageRows.forEach((row, index) => {
        result.push(`${index + 1}) ${row.name.en}}`);
      });
      console.log(result);
      onCopyToClipboard(result.join('\n'));
    }
  };

  return (
    <div className="my-4">
      <Space className="mb-4">
        <Typography>{rows.length} cards total</Typography>

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

type CardSceneLikelihoodProps = {
  card: CrimesHediondosCard;
  scenes: Dictionary<CrimeSceneTile>;
};

function CardSceneLikelihood({ card, scenes }: CardSceneLikelihoodProps) {
  return (
    <div>
      <Typography.Title level={5}>Scene Likelihood</Typography.Title>

      <div className="likelihood">
        {Object.values(scenes).map((scene) => {
          const [mostLikely, secondMostLikely] = card.likelihood?.[scene.id] ?? [];
          const hasMostLikely = mostLikely !== undefined;
          const likelyData = scene.values?.[mostLikely]?.en;
          const hasSecondMostLikely = secondMostLikely !== undefined;
          const secondLikelyData = scene.values?.[secondMostLikely]?.en;
          return (
            <div key={scene.id} className="likelihood-entry">
              <div className="bold">{scene.title.en}</div>
              <div
                className={clsx('likely-result', { 'likely-result--no-data': !hasMostLikely || !likelyData })}
              >
                {likelyData ? likelyData : 'No most likely value'}
              </div>
              <div
                className={clsx('likely-result--2', {
                  'likely-result--no-data': !hasSecondMostLikely || !secondLikelyData,
                })}
              >
                {secondLikelyData ? secondLikelyData : 'No second most likely value'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
