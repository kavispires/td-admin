import {
  AppstoreOutlined,
  BarsOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditFilled,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Button, Flex, Image, Segmented, Space, Switch, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy, truncate } from 'lodash';
import { useMemo, useState } from 'react';
import type { SuspectCard } from 'types';
import { stringRemoveAccents } from 'utils';
import { FeaturesFilterBar } from './FeaturesFilterBar';
import { PromptBuilder, PromptButton } from './PromptBuilder';
import { SuspectDrawer } from './SuspectDrawer';
import { SuspectImageCard } from './SuspectImageCard';

export function SuspectsContent({ data, addEntryToUpdate }: UseResourceFirestoreDataReturnType<SuspectCard>) {
  const { addParam, queryParams } = useQueryParams();
  const [view, setView] = useState('cards');

  const variant = queryParams.get('variant') ?? 'gb';
  const sortBy = queryParams.get('sortBy') ?? 'id';
  const cardsPerRow = Number(queryParams.get('cardsPerRow')) || 10;
  const activeFeature = queryParams.get('activeFeature') || '';
  // Suspect id just to 'key' the drawer
  const suspectId = queryParams.get('suspectId');

  const [cardWidth, ref] = useCardWidth(cardsPerRow, { margin: 0, gap: 8 });

  const deck: SuspectCard[] = useMemo(() => {
    return orderBy(
      Object.values(data),
      (e) => {
        if (sortBy === 'id') return Number(e.id.split('-').at(-1));
        if (sortBy === 'name.pt') return stringRemoveAccents(e.name.pt).toLowerCase();
        if (sortBy === 'name.en') return stringRemoveAccents(e.name.en).toLowerCase();
        return e[sortBy as keyof SuspectCard] ?? e.id;
      },
      ['asc'],
    );
  }, [data, sortBy]);

  const updateFeature = (suspectId: string, featureId: string) => {
    const suspect = data[suspectId];
    if (!suspect) return;

    const features = suspect.features || [];
    if (features.includes(featureId)) {
      // Remove feature
      addEntryToUpdate(suspectId, {
        ...suspect,
        features: features.filter((f) => f !== featureId),
      });
    } else {
      // Add feature
      addEntryToUpdate(suspectId, {
        ...suspect,
        features: [...features, featureId],
      });
    }
  };

  const updateKeyValue = (suspectId: string, key: keyof SuspectCard, value: unknown) => {
    const suspect = data[suspectId];
    if (!suspect) return;

    addEntryToUpdate(suspectId, {
      ...suspect,
      [key]: value,
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need to re-create for the functions
  const columns: TableProps<SuspectCard>['columns'] = useMemo(() => {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        sorter: (a: SuspectCard, b: SuspectCard) => {
          return Number(a.id.split('-').at(-1)) - Number(b.id.split('-').at(-1));
        },
        render: (id: string, entry: SuspectCard) => (
          <Flex align="center" gap={4} vertical>
            <Flex align="center" gap={6}>
              <Tag>{id}</Tag> <PromptButton suspect={entry} />
            </Flex>
            <SuspectImageCard cardId={entry.id} cardWidth={cardWidth / 1.5} className="suspect__image" />
          </Flex>
        ),
      },
      {
        title: 'Name (PT)',
        dataIndex: ['name', 'pt'],
        key: 'name.pt',
        sorter: (a: SuspectCard, b: SuspectCard) => {
          return stringRemoveAccents(a.name.pt.toLocaleLowerCase()).localeCompare(
            stringRemoveAccents(b.name.pt.toLocaleLowerCase()),
          );
        },
        render: (_, entry: SuspectCard) => {
          return (
            <Flex vertical>
              <Typography.Text>{entry.name.pt}</Typography.Text>
              <Typography.Text>{entry.name.en}</Typography.Text>
            </Flex>
          );
        },
      },
      {
        title: 'Label',
        dataIndex: 'label',
        key: 'label',
        render: (label: DualLanguageValue, entry: SuspectCard) => (
          <Flex vertical>
            <Flex vertical>
              <Typography.Text>{label.pt}</Typography.Text>
              <Typography.Text>{label.en}</Typography.Text>
            </Flex>

            <Typography.Paragraph
              code
              editable={{
                onChange: (value) => updateKeyValue(entry.id, 'animal', value),
              }}
            >
              {entry.animal}
            </Typography.Paragraph>
          </Flex>
        ),
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        sorter: (a: SuspectCard, b: SuspectCard) => a.gender.localeCompare(b.gender),
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        render: (age: number) => <Tag>{age}</Tag>,
        sorter: (a: SuspectCard, b: SuspectCard) => a.age.localeCompare(b.age),
      },
      {
        title: 'Ethnicity',
        dataIndex: 'ethnicity',
        key: 'ethnicity',
        sorter: (a: SuspectCard, b: SuspectCard) => a.ethnicity.localeCompare(b.ethnicity),
      },
      {
        title: 'Build',
        dataIndex: 'build',
        key: 'build',
        sorter: (a: SuspectCard, b: SuspectCard) => a.build.localeCompare(b.build),
      },
      {
        title: 'Height',
        dataIndex: 'height',
        key: 'height',
        sorter: (a: SuspectCard, b: SuspectCard) => a.height.localeCompare(b.height),
      },
      {
        title: 'Features',
        dataIndex: 'features',
        key: 'features',
        sorter: (a: SuspectCard, b: SuspectCard) => a.features.length - b.features.length,
        render: (features: string[], entry: SuspectCard) => (
          <Flex gap={8} vertical>
            <Flex gap={8} wrap="wrap">
              {features.map((feature) => (
                <Tag key={feature}>{feature}</Tag>
              ))}
            </Flex>
            {!!activeFeature && (
              <Flex className="mt-2 mb-4" gap={8}>
                <Typography.Text keyboard>{activeFeature}:</Typography.Text>
                <Switch
                  checked={features?.includes(activeFeature)}
                  checkedChildren={'✓'}
                  onChange={() => updateFeature(entry.id, activeFeature)}
                  unCheckedChildren={'✗'}
                />
              </Flex>
            )}
          </Flex>
        ),
      },
      {
        title: 'Edit',
        dataIndex: 'id',
        key: 'edit',
        width: 80,
        render: (id: string) => (
          <Button block onClick={() => addParam('suspectId', id)} size="small">
            <EditFilled />
          </Button>
        ),
      },
    ];
  }, [activeFeature, cardWidth]);

  return (
    <>
      <Flex align="center" justify="space-between">
        <Typography.Title level={2}>
          Deck {variant} ({deck.length})
        </Typography.Title>
        <Segmented
          onChange={(value) => setView(value)}
          options={[
            { value: 'cards', icon: <AppstoreOutlined /> },
            { value: 'table', icon: <BarsOutlined /> },
          ]}
        />
      </Flex>
      <Space>
        <FeaturesFilterBar /> <PromptBuilder />
      </Space>

      <Image.PreviewGroup>
        {view === 'cards' && (
          <Space className="my-2" key={variant} ref={ref} wrap>
            {deck.map((entry) => {
              return (
                <div className="suspect" key={entry.id} style={{ width: `${cardWidth}px` }}>
                  <SuspectImageCard cardId={entry.id} cardWidth={cardWidth} className="suspect__image" />

                  <div className="suspect__name">
                    <Flex align="center" gap={6}>
                      <Tag>{entry.id}</Tag> <PromptButton suspect={entry} />
                    </Flex>
                    <div>🇧🇷 {entry.name.pt}</div>
                    <Typography.Text ellipsis italic type="secondary">
                      <small>{truncate(entry.label.pt || '-', { length: 18 })}</small>
                    </Typography.Text>
                    <div>🇺🇸 {entry.name.en}</div>
                    <Typography.Text ellipsis italic type="secondary">
                      <small>{truncate(entry.label.en || '-', { length: 18 })}</small>
                    </Typography.Text>

                    <div className="suspect__info" style={getHeightBuildAlert(entry)}>
                      <div>
                        <div>
                          {entry.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {entry.age}
                        </div>
                        <div>
                          <em>{entry.ethnicity}</em>
                        </div>
                      </div>
                      <div className="uppercase">
                        <ColumnWidthOutlined />
                        <br />
                        {entry.build.charAt(0)}
                      </div>
                      <div className="uppercase">
                        <ColumnHeightOutlined />
                        <br />
                        {entry.height.charAt(0)}
                      </div>
                      <div>{entry?.features?.length ?? 0} features</div>
                    </div>
                    <Button
                      block
                      danger={!entry?.features || entry?.features?.length < 2}
                      onClick={() => addParam('suspectId', entry.id)}
                      size="small"
                    >
                      <EditFilled />
                    </Button>
                    {!!activeFeature && (
                      <Flex className="mt-2 mb-4" gap={8}>
                        <Typography.Text keyboard>{activeFeature}:</Typography.Text>
                        <Switch
                          checked={entry.features?.includes(activeFeature)}
                          checkedChildren={'✓'}
                          onChange={() => updateFeature(entry.id, activeFeature)}
                          unCheckedChildren={'✗'}
                        />
                      </Flex>
                    )}
                  </div>
                </div>
              );
            })}
          </Space>
        )}

        {view === 'table' && <Table columns={columns} dataSource={deck} pagination={false} rowKey="id" />}
      </Image.PreviewGroup>
      <SuspectDrawer addEntryToUpdate={addEntryToUpdate} data={data} key={suspectId} />
    </>
  );
}

const getHeightBuildAlert = (entry: SuspectCard) => {
  if (!entry.build || !entry.height || entry.build.length === 1 || entry.height.length === 1) {
    return { borderColor: 'red' };
  }
  return {};
};
