import { Button, Flex, Select, Space, Table, TableColumnsType, Tag, Typography } from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { cloneDeep, sample } from 'lodash';
import { CrimeSceneTile, CrimesHediondosCard } from 'types';

import { CloseOutlined, EditOutlined } from '@ant-design/icons';

import { CrimeItemCard } from './CrimeItemCard';
import { CrimesHediondosContentProps, CrimesHediondosInnerContentProps } from './CrimesHediondosContent';
import { useState } from 'react';
import { useToggle } from 'react-use';

type SceneTableProps = {
  sceneQuery: CrimesHediondosContentProps['scenesQuery'];
  allTags: CrimesHediondosInnerContentProps['allTags'];
  objects: CrimesHediondosInnerContentProps['rows'];
};

export function SceneTable({ sceneQuery, allTags, objects }: SceneTableProps) {
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
        <Space direction="vertical" style={{ minWidth: 150 }}>
          <DualLanguageTextField value={record.title} language="en" readOnly />
          <DualLanguageTextField value={record.title} language="pt" readOnly />
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
            {values.map((value, index) => (
              <li key={value.en}>
                <Typography>
                  {value.en} / {value.pt} <Tag>{record.tags?.[index]?.length ?? 0}</Tag>
                </Typography>

                <EditSceneValueTags
                  scene={record}
                  valueIndex={index}
                  addEntryToUpdate={sceneQuery.addEntryToUpdate}
                />
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  const expandableProps = useTableExpandableRows<CrimeSceneTile>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <SceneEvaluationSample scene={record} objects={objects} />,
  });

  return (
    <div className="my-4">
      <Typography.Title level={2} className="my-0">
        Scenes
      </Typography.Title>

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
        expandable={expandableProps}
        pagination={paginationProps}
      />
    </div>
  );
}

type EditSceneValueTagsProps = {
  scene: CrimeSceneTile;
  valueIndex: number;
  addEntryToUpdate: CrimesHediondosContentProps['scenesQuery']['addEntryToUpdate'];
};

function EditSceneValueTags({ scene, valueIndex, addEntryToUpdate }: EditSceneValueTagsProps) {
  const [isEditing, toggleEditing] = useToggle(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const currentTags = scene?.tags?.[valueIndex] ?? [];

  const handleAdd = () => {
    const copy = cloneDeep(scene);
    copy.tags = copy.tags ?? {};
    copy.tags[valueIndex] = [...selectedTags.filter(Boolean)];
    console.log(copy.tags);
    addEntryToUpdate(copy.id, copy);
    setSelectedTags([]);
    toggleEditing();
  };

  if (isEditing) {
    return (
      <>
        <Flex gap={6} align="center">
          <Select
            showSearch
            mode="tags"
            placeholder="Add new tag"
            options={[]}
            style={{ minWidth: '200px', maxWidth: '600px' }}
            autoClearSearchValue
            allowClear
            defaultValue={currentTags}
            onChange={setSelectedTags}
            tokenSeparators={[',']}
            onClear={() => setSelectedTags([])}
            defaultActiveFirstOption={false}
            size="small"
          />

          <Button onClick={handleAdd} disabled={selectedTags.length === 0}>
            Add
          </Button>
          <Button onClick={toggleEditing} icon={<CloseOutlined />} shape="circle" size="small" type="text" />
        </Flex>
      </>
    );
  }

  return (
    <>
      {scene?.tags?.[valueIndex]?.map((tag) => (
        <Tag key={tag} color="green">
          {tag}
        </Tag>
      ))}
      <Button shape="circle" size="small" onClick={toggleEditing} icon={<EditOutlined />} />
    </>
  );
}

type SceneEvaluationSampleProps = {
  scene: CrimeSceneTile;
  objects: CrimesHediondosCard[];
};

function SceneEvaluationSample({ scene, objects }: SceneEvaluationSampleProps) {
  const [activeObject, setActiveObject] = useState<{
    entry: CrimesHediondosCard;
    likelihood: Dictionary<number>;
  } | null>(null);

  const onGetSample = () => {
    const entry = sample(objects);
    const likelihood = calculateSampleLikelihood(scene, entry!);

    setActiveObject({ entry: entry!, likelihood });
  };

  return (
    <div className="full-width">
      <Button onClick={onGetSample}>Sample</Button>

      <div className="scene-options-sampler mt-4">
        {activeObject && <CrimeItemCard item={activeObject.entry} cardWidth={70} />}
        {scene.values.map((value, index) => {
          const val = activeObject?.likelihood[index] ?? 0;
          let color = val > 50 ? 'cyan' : val > 25 ? 'orange' : 'red';
          const max = Math.max(...Object.values(activeObject?.likelihood ?? {}));
          color = val === max ? 'green' : color;
          return (
            <Space key={value.en} direction="vertical">
              <Typography.Text>
                {value.en} / {value.pt}
              </Typography.Text>
              <Tag color={val === 0 ? undefined : color}>{val}%</Tag>
            </Space>
          );
        })}
      </div>
    </div>
  );
}

const calculateSampleLikelihood = (scene: CrimeSceneTile, object: CrimesHediondosCard) => {
  // For each tag in the object that is present in the scene option, add 1 to its likelihood value, also count if the tag repeats about the scene values

  const optionsTagCount: Dictionary<number> = {};
  const objectTagsRepetition: Dictionary<number> = {};

  console.log('=========');

  // Build dictionary
  (object.tags ?? []).forEach((tag: string) => {
    objectTagsRepetition[tag] = 0;

    Object.keys(scene.tags ?? {}).forEach((sceneTagIndex: string) => {
      const sceneValueTags = scene.tags?.[sceneTagIndex] ?? [];

      if (sceneValueTags.includes(tag)) {
        objectTagsRepetition[tag] = objectTagsRepetition[tag] + 1;
      }
    });
  });

  console.log(JSON.parse(JSON.stringify(objectTagsRepetition)));

  Object.keys(objectTagsRepetition).forEach((tag) => {
    // Transform the repetition count into a weight where 0 is 0, 1 is 100, 2-5 reduces the weight by 10% each repetition
    const weight = Math.max(0, 1 - objectTagsRepetition[tag] * 0.1);
    objectTagsRepetition[tag] = weight;
  });

  console.log(JSON.parse(JSON.stringify(objectTagsRepetition)));

  // Build dictionary
  (object.tags ?? []).forEach((tag: string) => {
    Object.keys(scene.tags ?? {}).forEach((sceneTagIndex: string) => {
      const sceneValueTags = scene.tags?.[sceneTagIndex] ?? [];

      if (sceneValueTags.includes(tag)) {
        optionsTagCount[sceneTagIndex] = (optionsTagCount[sceneTagIndex] ?? 0) + objectTagsRepetition[tag];
      }
    });
  });

  console.log(JSON.parse(JSON.stringify(optionsTagCount)));

  // Calculate likelihood percentage for each option where the 100% is the max on the object tags
  Object.keys(optionsTagCount).forEach((sceneTagIndex) => {
    optionsTagCount[sceneTagIndex] = Math.floor(
      Math.min(100, ((optionsTagCount[sceneTagIndex] ?? 0) / (object.tags?.length ?? 1)) * 100)
    );
  });

  console.log(JSON.parse(JSON.stringify(optionsTagCount)));

  return optionsTagCount;
};
