import { Image, Layout, Space, Typography } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCardsFilters } from 'components/Images/ImageCardsFilters';
import { ImageCard } from 'components/Images/ImageCard';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { ResourceResponseState } from 'components/Resource/ResourceResponseState';
import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDIData } from 'hooks/useTDIData';
import { isEmpty } from 'lodash';
import { useState } from 'react';

const DECK = Array(252).fill(1);

export function ImageCards() {
  // Set default query params
  const qp = useQueryParams({ deck: 'd1' });
  const { deck = 'd1' } = qp.queryParams;

  const { isLoading, error, data } = useTDIData();
  const hasResponseData = !isEmpty(data);
  const [cardsPerRow, setCardsPerRow] = useState(8);
  const [cardWidth, ref] = useCardWidth(cardsPerRow);

  return (
    <PageLayout title="Images" subtitle="Image Cards">
      <Layout hasSider>
        <PageSider>
          <ResourceResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <ImageCardsFilters
            decksData={data}
            selectedDeck={deck}
            setSelectedDeck={(d) => qp.addParam('deck', d)}
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={hasResponseData}>
            <Typography.Title level={2}>
              Deck {deck} ({DECK.length})
            </Typography.Title>

            <Image.PreviewGroup>
              <Space ref={ref} wrap className="my-2" key={deck}>
                {Boolean(deck) &&
                  DECK.map((e, i) => {
                    const num = e + i < 10 ? `0${e + i}` : `${e + i}`;
                    const id = `td-${deck}-${num}`;

                    return <ImageCard id={id} width={cardWidth} key={id} />;
                  })}
              </Space>
            </Image.PreviewGroup>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
