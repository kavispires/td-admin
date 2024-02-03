import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Image, Layout, Space, Tag, Typography } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCard } from 'components/Images/ImageCard';
import { SuspectsFilters } from 'components/Images/SuspectsFilters';
import { SuspectsStats } from 'components/Images/SuspectsStats';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { SuspectCard } from 'types';

export function Suspects() {
  // Set default query params
  const qp = useQueryParams({ version: 'ct' });
  const { version = 'ct' } = qp.queryParams;

  const { isLoading, error, data, hasResponseData } = useTDResource<SuspectCard>('suspects');

  const [cardsPerRow, setCardsPerRow] = useState(8);
  const [cardWidth, ref] = useCardWidth(cardsPerRow);
  const [sortBy, setSortBy] = useState('id');

  const deck = useMemo(() => {
    return orderBy(Object.values(data), [sortBy], ['asc']).map((e) => {
      const splitId = e.id.split('-');
      const id = version === 'original' ? e.id : `${splitId[0]}-${version}-${splitId[1]}`;
      return {
        ...e,
        id,
      };
    });
  }, [data, version, sortBy]);

  return (
    <PageLayout title="Images" subtitle="Suspects">
      <Layout hasSider>
        <PageSider>
          <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <SuspectsFilters
            selectedVersion={version}
            setSelectedVersion={(d) => qp.addParam('version', d)}
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <SuspectsStats data={data} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
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
                            {entry.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {entry.age}
                          </div>
                          <div>
                            <em>{entry.ethnicity}</em>
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
