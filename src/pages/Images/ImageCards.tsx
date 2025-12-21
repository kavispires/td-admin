import { Flex, Image, Layout, Space, Typography } from 'antd';
import { ResponseState } from 'components/Common';
import { IdTag } from 'components/Common/IdTag';
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
  const { queryParams, addParam, is } = useQueryParams({ deck: 'd1' });
  const deck = queryParams.get('deck') ?? 'd1';

  const { isLoading, error, data } = useImagesDecks();
  const hasResponseData = !isEmpty(data);
  const [cardsPerRow, setCardsPerRow] = useState(8);
  const [cardWidth, ref] = useCardWidth(cardsPerRow);

  return (
    <PageLayout subtitle="Image Cards" title="Images">
      <Layout hasSider>
        <PageSider>
          <ResponseState error={error} hasResponseData={hasResponseData} isLoading={isLoading} />
          <ImageCardsFilters
            cardsPerRow={cardsPerRow}
            decksData={data}
            selectedDeck={deck}
            setCardsPerRow={setCardsPerRow}
            setSelectedDeck={(d) => addParam('deck', d)}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper error={error} hasResponseData={hasResponseData} isLoading={isLoading}>
            <Typography.Title level={2}>
              Deck {deck} ({DECK.length})
            </Typography.Title>

            <Image.PreviewGroup
              preview={{
                countRender: (current, total) => {
                  const id = `td-${deck}-${current.toString().padStart(2, '0')}`;
                  return (
                    <Space align="center" direction="vertical">
                      <Typography.Text>
                        {current} / {total}
                      </Typography.Text>
                      <IdTag>{id}</IdTag>
                    </Space>
                  );
                },
              }}
            >
              <Space className="my-2" key={deck} ref={ref} wrap>
                {Boolean(deck) &&
                  DECK.map((e, i) => {
                    const num = e + i < 10 ? `0${e + i}` : `${e + i}`;
                    const id = `td-${deck}-${num}`;

                    return (
                      <Flex align="center" key={id} style={{ gap: 8 }} vertical>
                        <ImageCard cardId={id} cardWidth={cardWidth} key={id} />
                        {is('showImageIds') && <IdTag withQuotes>{id}</IdTag>}
                      </Flex>
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
export default ImageCards;
