import { Button, Flex, Image, Layout, Tag } from 'antd';

import { useCardWidth } from 'hooks/useCardWidth';
import { useQueryParams } from 'hooks/useQueryParams';
import { useKey, useWindowSize } from 'react-use';
import { ImageCard } from '../ImageCard';
import { RelationshipCountTag } from './RelationshipCountTag';
import { type UseImageCardsRelationshipDataReturnValue, useRandomCards } from './hooks';
import { FullScreenModal } from 'components/Common/FullScreenModal';

type ComparatorProps = {
  query: UseImageCardsRelationshipDataReturnValue;
};

export function Comparator({ query }: ComparatorProps) {
  const { width } = useWindowSize();
  const [cardWidth] = useCardWidth(1, { minWidth: width / 3 });

  const { data, setDirty } = query;

  // Selects a random deck, but gives option select for a specific deck (1-10)
  const { cardAId, cardA, cardBId, cardB, relate, unrelate } = useRandomCards(data, setDirty);

  const { addParam, is } = useQueryParams();
  const isOpen = is('open');

  useKey('1', () => {
    if (isOpen) unrelate();
  });
  useKey('2', () => {
    if (isOpen) relate();
  });

  return (
    <Layout.Content className="dev-content py-4">
      <Button block onClick={() => addParam('open', 'true')}>
        Open Modal
      </Button>

      <FullScreenModal
        title={`Card A: ${cardAId} vs Card B: ${cardBId}`}
        open={isOpen}
        onClose={() => addParam('open', 'false')}
        actions={[
          <Button key="1" onClick={unrelate} size="large" block>
            Unrelated
          </Button>,
          <Button key="2" onClick={relate} size="large" block type="primary">
            Related
          </Button>,
        ]}
      >
        <Image.PreviewGroup>
          <Flex className="center" wrap="wrap" justify="center">
            <Flex vertical>
              <ImageCard id={cardAId} width={cardWidth} />
              <Flex>
                <RelationshipCountTag card={cardA} />
                <Tag>{cardAId}</Tag>
              </Flex>
            </Flex>
            <Flex vertical>
              <ImageCard id={cardBId} width={cardWidth} />
              <Flex>
                <RelationshipCountTag card={cardB} />
                <Tag>{cardBId}</Tag>
              </Flex>
            </Flex>
          </Flex>
        </Image.PreviewGroup>
      </FullScreenModal>
    </Layout.Content>
  );
}
