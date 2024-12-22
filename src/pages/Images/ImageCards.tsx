import { Image, Layout, Space, Typography } from 'antd';
import { ResponseState } from 'components/Common';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCard } from 'components/Images/ImageCard';
import { ImageCardsFilters } from 'components/Images/ImageCardsFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useCardWidth } from 'hooks/useCardWidth';
import { useImagesDecks } from 'hooks/useImagesDecks';
import { useQueryParams } from 'hooks/useQueryParams';
import { isEmpty } from 'lodash';
import { useState } from 'react';

const DECK = Array(252).fill(1);

function ImageCards() {
  // Set default query params
  const { queryParams, addParam } = useQueryParams({ deck: 'd1' });
  const deck = queryParams.get('deck') ?? 'd1';

  const { isLoading, error, data } = useImagesDecks();
  const hasResponseData = !isEmpty(data);
  const [cardsPerRow, setCardsPerRow] = useState(8);
  const [cardWidth, ref] = useCardWidth(cardsPerRow);

  return (
    <PageLayout title="Images" subtitle="Image Cards">
      <Layout hasSider>
        <PageSider>
          <ResponseState hasResponseData={hasResponseData} isLoading={isLoading} error={error} />
          <ImageCardsFilters
            decksData={data}
            selectedDeck={deck}
            setSelectedDeck={(d) => addParam('deck', d)}
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
export default ImageCards;
