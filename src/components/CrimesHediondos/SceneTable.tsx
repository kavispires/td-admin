import { Button, Space, Table, type TableColumnsType, Tag, Typography } from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo } from 'react';
import type { CrimeSceneTile } from 'types';
import type { CrimesHediondosContentProps, CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

type SceneTableProps = {
  sceneQuery: CrimesHediondosContentProps['scenesQuery'];
  objects: CrimesHediondosInnerContentProps['rows'];
};

export function SceneTable({ sceneQuery, objects }: SceneTableProps) {
  const onCopyToClipboard = useCopyToClipboardFunction();
  const rows = Object.values(sceneQuery.data ?? []);

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const onCopyOptions = (scene: CrimeSceneTile) => {
    const result: string[] = [];
    result.push(`"${scene.description.en}"`);
    scene.values.forEach((value, index) => {
      result.push(`${index}) ${value.en}`);
    });

    onCopyToClipboard(result.join('\n'));
  };

  const columns: TableColumnsType<CrimeSceneTile> = [
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <Space orientation="vertical" style={{ minWidth: 150 }}>
          <DualLanguageTextField language="en" readOnly value={record.title} />
          <DualLanguageTextField language="pt" readOnly value={record.title} />
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
      title: 'Options',
      dataIndex: 'values',
      key: 'tags',
      render: (values: DualLanguageValue[], record) => (
        <>
          <Button onClick={() => onCopyOptions(record)}>Copy options</Button>
          <ul>
            {values.map((value) => (
              <li key={value.en}>
                <Typography>
                  {value.en} / {value.pt}
                </Typography>
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  const expandableProps = useTableExpandableRows<CrimeSceneTile>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <SceneLikelihoodCards objects={objects} scene={record} />,
  });

  return (
    <div className="my-4">
      <Typography.Title className="my-0" level={2}>
        Scenes
      </Typography.Title>

      <Table
        columns={columns}
        dataSource={rows}
        expandable={expandableProps}
        pagination={paginationProps}
        rowKey="id"
      />
    </div>
  );
}

type SceneLikelihoodCardsProps = {
  scene: CrimeSceneTile;
  objects: CrimesHediondosInnerContentProps['rows'];
};

function SceneLikelihoodCards({ scene, objects }: SceneLikelihoodCardsProps) {
  const percentages = useMemo(() => {
    let total = 0;
    const counts: Record<string, number> = {};

    objects.forEach((object) => {
      if (object.likelihood?.[scene.id]) {
        const values = object.likelihood[scene.id];
        const value = values[0];
        counts[value] = (counts[value] || 0) + 1;
        total += 1;
      }
    });

    const percentages = Object.entries(counts).map(([key, count]) => ({
      value: key,
      percentage: (count / total) * 100,
    }));

    return percentages;
  }, [objects, scene.id]);

  return (
    <div>
      <h3>
        {scene.title.en} / {scene.title.pt}
      </h3>
      {/* Additional rendering logic for likelihood cards */}
      <ul>
        {percentages.map(({ value, percentage }) => (
          <li key={value}>
            <Tag>{scene.values[Number(value)].en}</Tag> {percentage.toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
