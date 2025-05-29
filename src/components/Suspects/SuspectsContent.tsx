import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditFilled,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Button, Image, Space, Tag, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { SuspectCard } from 'types';
import { SuspectDrawer } from './SuspectDrawer';
import { getSuspectImageId } from './utils';

export function SuspectsContent({ data, addEntryToUpdate }: UseResourceFirestoreDataReturnType<SuspectCard>) {
  const { addParam, queryParams } = useQueryParams();

  const version = queryParams.get('version') ?? 'gb';
  const sortBy = queryParams.get('sortBy') ?? 'id';
  const cardsPerRow = Number(queryParams.get('cardsPerRow')) || 8;

  const [cardWidth, ref] = useCardWidth(cardsPerRow);

  const deck: SuspectCard[] = useMemo(() => {
    return orderBy(
      Object.values(data),
      (e) => {
        if (sortBy === 'id') return Number(e.id.split('-').at(-1));
        return e[sortBy as keyof SuspectCard] ?? e.id;
      },
      ['asc'],
    );
  }, [data, sortBy]);

  return (
    <>
      <Typography.Title level={2}>
        Deck {version} ({deck.length})
      </Typography.Title>

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
                  <div>
                    <Tag>{entry.id}</Tag>
                  </div>
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
                </div>
              </div>
            );
          })}
        </Space>
      </Image.PreviewGroup>
      <SuspectDrawer data={data} addEntryToUpdate={addEntryToUpdate} />
    </>
  );
}

const getHeightBuildAlert = (entry: SuspectCard) => {
  if (!entry.build || !entry.height || entry.build.length === 1 || entry.height.length === 1) {
    return { borderColor: 'red' };
  }
  return {};
};
