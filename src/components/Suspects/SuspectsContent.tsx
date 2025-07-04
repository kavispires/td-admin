import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditFilled,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Button, Flex, Image, Space, Switch, Tag, Typography } from 'antd';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy, truncate } from 'lodash';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
import { stringRemoveAccents } from 'utils';
import { FeaturesFilterBar } from './FeaturesFilterBar';
import { PromptBuilder, PromptButton } from './PromptBuilder';
import { SuspectDrawer } from './SuspectDrawer';
import { SuspectImageCard } from './SuspectImageCard';

export function SuspectsContent({ data, addEntryToUpdate }: UseResourceFirestoreDataReturnType<SuspectCard>) {
  const { addParam, queryParams } = useQueryParams();

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

  return (
    <>
      <Typography.Title level={2}>
        Deck {variant} ({deck.length})
      </Typography.Title>
      <Space>
        <FeaturesFilterBar /> <PromptBuilder />
      </Space>

      <Image.PreviewGroup>
        <Space className="my-2" key={variant} ref={ref} wrap>
          {deck.map((entry) => {
            return (
              <div className="suspect" key={entry.id} style={{ width: `${cardWidth}px` }}>
                <SuspectImageCard className="suspect__image" id={entry.id} width={cardWidth} />

                <div className="suspect__name">
                  <Flex align="center" gap={6}>
                    <Tag>{entry.id}</Tag> <PromptButton suspect={entry} />
                  </Flex>
                  <Typography.Text italic type="secondary">
                    <small>{truncate(entry.note || '-', { length: 18 })}</small>
                  </Typography.Text>
                  <div>🇧🇷 {entry.name.pt}</div>
                  <div>🇺🇸 {entry.name.en}</div>
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
