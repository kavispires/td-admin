import { Button, Flex, Image, Layout, Modal, Tag } from 'antd';

import { UseImageCardsRelationshipDataReturnValue, useRandomCards } from './hooks';
import { useCardWidth } from 'hooks/useCardWidth';
import { RelationshipCountTag } from './RelationshipCountTag';
import { ImageCard } from '../ImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import { useKey, useWindowSize } from 'react-use';

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

  useKey('1', unrelate);
  useKey('2', relate);

  return (
    <Layout.Content className="dev-content py-4">
      <Button block onClick={() => addParam('open', 'true')}>
        Open Modal
      </Button>

      <Modal
        title={`Card A: ${cardAId}`}
        open={is('open')}
        width={width * 0.95}
        onCancel={() => addParam('open', 'false')}
        footer={null}
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

        <Flex gap={32} className="my-10">
          <Button onClick={unrelate} size="large" block>
            Unrelated
          </Button>
          <Button onClick={relate} size="large" block type="primary">
            Related
          </Button>
        </Flex>
      </Modal>
    </Layout.Content>
  );
}
