import {
  AppstoreOutlined,
  BarsOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditFilled,
  GitlabFilled,
  InteractionFilled,
  ManOutlined,
  MessageFilled,
  WomanOutlined,
} from '@ant-design/icons';
import { Button, Flex, Image, Segmented, Space, Switch, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import clsx from 'clsx';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy, truncate } from 'lodash';
import { useMemo, useState } from 'react';
import type { SuspectCard, SuspectExtendedInfo } from 'types';
import { stringRemoveAccents, wait } from 'utils';
import { ActiveExtendedInfoSwitch, ExtendedInfoFilterBar } from './ExtendedInfoFilterBar';
import { ActiveFeatureSwitch, FeaturesFilterBar } from './FeaturesFilterBar';
import { PromptBuilder, PromptButton } from './PromptBuilder';
import { SuspectDrawer } from './SuspectDrawer';
import { SuspectImageCard } from './SuspectImageCard';
import { useInferFieldsFromTestimonies } from './useInferFieldsFromTestimonies';

export function SuspectsListing({
  suspectsQuery,
  suspectsExtendedInfoQuery,
}: {
  suspectsQuery: UseResourceFirestoreDataReturnType<SuspectCard>;
  suspectsExtendedInfoQuery: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>;
}) {
  const suspects = suspectsQuery.data;
  const extendedInfo = suspectsExtendedInfoQuery.data;
  const { addParam, queryParams } = useQueryParams();
  const [view, setView] = useState('cards');

  const variant = queryParams.get('variant') ?? 'gb';
  const sortBy = queryParams.get('sortBy') ?? 'id';
  const cardsPerRow = Number(queryParams.get('cardsPerRow')) || 10;
  const activeFeature = queryParams.get('activeFeature') || '';
  const activeExtendedInfo = queryParams.get('activeExtendedInfo') || '';
  // Suspect id just to 'key' the drawer
  const suspectId = queryParams.get('suspectId');

  const [cardWidth, ref] = useCardWidth(cardsPerRow, { margin: 0, gap: 8 });

  const deck: SuspectCard[] = useMemo(() => {
    return orderBy(
      Object.values(suspects),
      (e) => {
        if (sortBy === 'name.pt') return stringRemoveAccents(e.name.pt).toLowerCase();
        if (sortBy === 'name.en') return stringRemoveAccents(e.name.en).toLowerCase();
        return e[sortBy as keyof SuspectCard] ?? e.id;
      },
      ['asc'],
    );
  }, [suspects, sortBy]);

  const personalityOptions = useMemo(() => {
    const set = Object.values(extendedInfo).reduce((acc, info) => {
      if (info.traits) {
        info.traits.forEach((trait) => {
          acc.add(trait);
        });
      }
      return acc;
    }, new Set<string>());
    return Array.from(set).sort();
  }, [extendedInfo]);

  const updateSuspectFeature = (suspectId: string, featureId: string) => {
    const suspect = suspects[suspectId];
    if (!suspect) return;

    const features = suspect.features || [];
    if (features.includes(featureId)) {
      // Remove feature
      suspectsQuery.addEntryToUpdate(suspectId, {
        ...suspect,
        features: features.filter((f) => f !== featureId),
      });
    } else {
      // Add feature
      suspectsQuery.addEntryToUpdate(suspectId, {
        ...suspect,
        features: [...features, featureId],
      });
    }
  };

  const _updateKeyValue = (suspectId: string, key: keyof SuspectCard, value: unknown) => {
    const suspect = suspects[suspectId];
    if (!suspect) return;

    suspectsQuery.addEntryToUpdate(suspectId, {
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
              <Tag>{id}</Tag> <PromptButton extendedInfo={extendedInfo[entry.id]} suspect={entry} />
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
        title: 'Race',
        dataIndex: 'race',
        key: 'race',
        sorter: (a: SuspectCard, b: SuspectCard) => a.race.localeCompare(b.race),
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
                  onChange={() => updateSuspectFeature(entry.id, activeFeature)}
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

  const onInfer = useInferFieldsFromTestimonies(suspectsExtendedInfoQuery.addEntryToUpdate);
  const [inferring, setInferring] = useState(false);
  const onInferForAll = () => {
    setInferring(true);
    Promise.resolve()
      .then(async () => {
        for (const entry of deck) {
          // eslint-disable-next-line no-await-in-loop

          await onInfer(extendedInfo[entry.id]);
          await wait(300); // To avoid rate limits
        }
      })
      .finally(() => setInferring(false));
  };

  return (
    <>
      <Flex align="center" justify="space-between">
        <Typography.Title level={2}>Total Suspects: {deck.length}</Typography.Title>
        <Segmented
          onChange={(value) => setView(value)}
          options={[
            { value: 'cards', icon: <AppstoreOutlined /> },
            { value: 'table', icon: <BarsOutlined /> },
          ]}
        />
      </Flex>
      <Space style={{ position: 'sticky', top: 0, background: 'black', zIndex: 1, width: '100%' }}>
        <FeaturesFilterBar /> <ExtendedInfoFilterBar />
      </Space>

      <Flex align="center" className="my-2" gap={8} justify="space-between">
        <PromptBuilder />
        <Flex align="center" gap={8}>
          <Button icon={<InteractionFilled />} loading={inferring} onClick={onInferForAll} size="small">
            Infer info from Testimonies
          </Button>
        </Flex>
      </Flex>

      <Image.PreviewGroup>
        {view === 'cards' && (
          <Space className="my-2" key={variant} ref={ref} wrap>
            {deck.map((entry) => {
              const extendedEntry = extendedInfo[entry.id];
              return (
                <div className="suspect" key={entry.id} style={{ width: `${cardWidth}px` }}>
                  <SuspectImageCard cardId={entry.id} cardWidth={cardWidth} className="suspect__image" />

                  <div className="suspect__name">
                    <Flex align="center" gap={3}>
                      <Tag>{entry.id}</Tag> <PromptButton extendedInfo={extendedEntry} suspect={entry} />{' '}
                      {!extendedEntry.prompt && <MessageFilled style={{ color: 'red' }} />}{' '}
                      {!!extendedEntry.animal && <GitlabFilled style={{ color: 'sandybrown' }} />}
                    </Flex>
                    <div style={{ backgroundColor: !entry.name.pt ? 'red' : 'transparent' }}>
                      🇧🇷 {entry.name.pt}
                    </div>
                    <Typography.Text
                      className={clsx({ 'missing-value': !extendedEntry.persona.pt })}
                      ellipsis
                      italic
                      type="secondary"
                    >
                      <small>{truncate(extendedEntry.persona.pt || '-', { length: 18 })}</small>
                    </Typography.Text>
                    <div style={{ backgroundColor: !entry.name.en ? 'red' : 'transparent' }}>
                      🇺🇸 {entry.name.en}
                    </div>
                    <Typography.Text
                      className={clsx({ 'missing-value': !extendedEntry.persona.en })}
                      ellipsis
                      italic
                      type="secondary"
                    >
                      <small>{truncate(extendedEntry.persona.en || '-', { length: 18 })}</small>
                    </Typography.Text>

                    <div className="suspect__info" style={getHeightBuildAlert(entry)}>
                      <div>
                        <div>
                          {entry.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {entry.age}
                        </div>
                        <div>
                          <em>{entry.race}</em>
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
                      <div className={clsx({ 'missing-value': !entry.features?.length })}>
                        {entry?.features?.length ?? 0} feats
                      </div>
                      <div
                        className={clsx({
                          'missing-value': !extendedEntry?.traits?.length,
                          'missing-value-alt': !extendedEntry?.description,
                        })}
                      >
                        {extendedEntry?.traits?.length ?? 0} traits
                      </div>
                    </div>
                    <Button
                      block
                      danger={!entry?.features || entry?.features?.length < 2}
                      onClick={() => addParam('suspectId', entry.id)}
                      size="small"
                    >
                      <EditFilled />
                    </Button>

                    <ActiveFeatureSwitch
                      activeFeature={activeFeature}
                      entry={entry}
                      updateSuspectFeature={updateSuspectFeature}
                    />

                    <ActiveExtendedInfoSwitch
                      activeExtendedInfo={activeExtendedInfo}
                      addEntryToUpdate={suspectsExtendedInfoQuery.addEntryToUpdate}
                      entry={extendedEntry}
                    />
                  </div>
                </div>
              );
            })}
          </Space>
        )}

        {view === 'table' && <Table columns={columns} dataSource={deck} pagination={false} rowKey="id" />}
      </Image.PreviewGroup>
      <SuspectDrawer
        addExtendedInfoEntryToUpdate={suspectsExtendedInfoQuery.addEntryToUpdate}
        addSuspectEntryToUpdate={suspectsQuery.addEntryToUpdate}
        key={suspectId}
        personalityOptions={personalityOptions}
        suspects={suspects}
        suspectsExtendedInfos={suspectsExtendedInfoQuery.data}
      />
    </>
  );
}

const getHeightBuildAlert = (entry: SuspectCard) => {
  if (!entry.build || !entry.height || entry.build.length === 1 || entry.height.length === 1) {
    return { borderColor: 'red' };
  }
  return {};
};
