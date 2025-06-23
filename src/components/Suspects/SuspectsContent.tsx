import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditFilled,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Button, Flex, Image, Space, Switch, Tag, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
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
import { getSuspectImageId } from './utils';

export function SuspectsContent({ data, addEntryToUpdate }: UseResourceFirestoreDataReturnType<SuspectCard>) {
  const { addParam, queryParams } = useQueryParams();

  const version = queryParams.get('version') ?? 'gb';
  const sortBy = queryParams.get('sortBy') ?? 'id';
  const cardsPerRow = Number(queryParams.get('cardsPerRow')) || 8;
  const activeFeature = queryParams.get('activeFeature') || '';
  // Suspect id just to 'key' the drawer
  const suspectId = queryParams.get('suspectId');

  const [cardWidth, ref] = useCardWidth(cardsPerRow, { margin: 16 });

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
        Deck {version} ({deck.length})
      </Typography.Title>
      <Space>
        <FeaturesFilterBar /> <PromptBuilder />
      </Space>

      <Image.PreviewGroup>
        <Space ref={ref} wrap className="my-2" key={version}>
          {deck.map((entry) => {
            return (
              <div key={entry.id} className="suspect" style={{ width: `${cardWidth}px` }}>
                <ImageCard
                  id={getSuspectImageId(entry.id, version)}
                  width={cardWidth}
                  className="suspect__image"
                />

                <div className="suspect__name">
                  <Flex gap={6} align="center">
                    <Tag>{entry.id}</Tag> <PromptButton suspect={entry} />
                  </Flex>
                  <Typography.Text type="secondary" italic>
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
                    size="small"
                    block
                    onClick={() => addParam('suspectId', entry.id)}
                    danger={!entry?.features || entry?.features?.length < 2}
                  >
                    <EditFilled />
                  </Button>
                  {!!activeFeature && (
                    <Flex gap={8} className="mt-2 mb-4">
                      <Typography.Text keyboard>{activeFeature}:</Typography.Text>
                      <Switch
                        checked={entry.features?.includes(activeFeature)}
                        onChange={() => updateFeature(entry.id, activeFeature)}
                        checkedChildren={'✓'}
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
      <SuspectDrawer data={data} addEntryToUpdate={addEntryToUpdate} key={suspectId} />
    </>
  );
}

const getHeightBuildAlert = (entry: SuspectCard) => {
  if (!entry.build || !entry.height || entry.build.length === 1 || entry.height.length === 1) {
    return { borderColor: 'red' };
  }
  return {};
};
