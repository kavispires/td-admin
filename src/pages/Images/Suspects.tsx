import { ColumnHeightOutlined, ColumnWidthOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Image, Layout, Space, Tag, Typography } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCard } from 'components/Images/ImageCard';
import { SuspectsFilters } from 'components/Images/SuspectsFilters';
import { SuspectsStats } from 'components/Images/SuspectsStats';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResponseState } from 'components/Common';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import type { SuspectCard } from 'types';

function Suspects() {
  // Set default query params
  const { queryParams, addParam } = useQueryParams({ version: 'ct' });
  const version = queryParams.get('version') ?? 'ct';

  const query = useTDResource<SuspectCard>('suspects');

  const [cardsPerRow, setCardsPerRow] = useState(8);
  const [cardWidth, ref] = useCardWidth(cardsPerRow);
  const [sortBy, setSortBy] = useState('id');

  const deck = useMemo(() => {
    return orderBy(
      Object.values(query.data),
      (e) => {
        if (sortBy === 'id') return Number(e.id.split('-').at(-1));
        return e[sortBy as keyof SuspectCard] ?? e.id;
      },
      ['asc'],
    ).map((e) => {
      const splitId = e.id.split('-');
      const id = version === 'original' ? e.id : `${splitId[0]}-${version}-${splitId[1]}`;
      return {
        ...e,
        id,
      };
    });
  }, [query.data, version, sortBy]);

  return (
    <PageLayout title="Images" subtitle="Suspects">
      <Layout hasSider>
        <PageSider>
          <ResponseState
            hasResponseData={query.hasResponseData}
            isLoading={query.isLoading}
            error={query.error}
          />

          <SuspectsFilters
            selectedVersion={version}
            setSelectedVersion={(d) => addParam('version', d)}
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <SuspectsStats data={query.data} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={query.isLoading}
            error={query.error}
            hasResponseData={query.hasResponseData}
          >
            <Typography.Title level={2}>
              Deck {version} ({deck.length})
            </Typography.Title>

            <Image.PreviewGroup>
              <Space ref={ref} wrap className="my-2" key={version}>
                {deck.map((entry) => {
                  return (
                    <div key={entry.id} className="suspect" style={{ width: `${cardWidth}px` }}>
                      <ImageCard id={entry.id} width={cardWidth} className="suspect__image" />

                      <div className="suspect__name">
                        <div>
                          <Tag>{entry.id}</Tag>
                        </div>
                        <div>🇧🇷 {entry.name.pt}</div>
                        <div>🇺🇸 {entry.name.en}</div>
                        <div className="suspect__info">
                          <div>
                            <div>
                              {entry.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {entry.age}
                            </div>
                            <div>
                              <em>{entry.ethnicity}</em>
                            </div>
                          </div>
                          <div>
                            <ColumnWidthOutlined />
                            <br />
                            {entry.build}
                          </div>
                          <div>
                            <ColumnHeightOutlined />
                            <br />
                            {entry.height}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Image.PreviewGroup>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Suspects;
