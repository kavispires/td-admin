import { Button, Card, Image, Layout, Space } from 'antd';

import { CheckCircleFilled } from '@ant-design/icons';

import './dev-image-cards.scss';
import { UseImageCardsRelationshipDataReturnValue, useRandomCards } from './hooks';
import { useCardWidth } from 'hooks/useCardWidth';
import { RelationshipCountTag } from './RelationshipCountTag';
import { ImageCard } from '../ImageCard';

type ComparatorProps = {
  query: UseImageCardsRelationshipDataReturnValue;
};

export function Comparator({ query }: ComparatorProps) {
  const [cardWidth] = useCardWidth(2);

  const { data, isDirty, setDirty, isSuccess, isSaving, save } = query;

  // Selects a random deck, but gives option select for a specific deck (1-10)
  const { cardAId, cardA, cardBId, cardB, relate, unrelate, areRelated, onRandomCards } = useRandomCards(
    data,
    setDirty
  );

  return (
    <Layout.Content className="dev-content">
      {isSaving && <div>Saving...</div>}
      {isSuccess && !isSaving && (
        <Space className="space-container" direction="vertical">
          <Button onClick={onRandomCards}>New Random Cards</Button>
          <Card title={`${cardAId} X ${cardBId}`} extra={areRelated && <CheckCircleFilled />}>
            <div className="image-card-card">
              <Image.PreviewGroup>
                <div className="image-card-card__image">
                  <ImageCard id={cardAId} width={cardWidth} />
                  <RelationshipCountTag card={cardA} />
                </div>
                <div className="image-card-card__image">
                  <ImageCard id={cardBId} width={cardWidth} />
                  <RelationshipCountTag card={cardB} />
                </div>
              </Image.PreviewGroup>
            </div>

            <Space className="image-card-categorizer-options">
              <Button onClick={unrelate} size="large" block>
                Unrelated
              </Button>
              <Button onClick={relate} size="large" block type="primary">
                Related
              </Button>
            </Space>
          </Card>

          <Button type="primary" onClick={() => save({})} disabled={!isDirty} loading={isSaving}>
            Save
          </Button>
        </Space>
      )}
    </Layout.Content>
  );
}
