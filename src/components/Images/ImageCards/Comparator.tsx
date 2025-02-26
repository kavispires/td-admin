import { Button, Flex, Image, Input, Layout, Tag, Typography } from 'antd';
import { FullScreenModal } from 'components/Common/FullScreenModal';
import { useCardWidth } from 'hooks/useCardWidth';
import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useQueryParams } from 'hooks/useQueryParams';
import { isEmpty, sample } from 'lodash';
import { useState } from 'react';
import { useKey, useWindowSize } from 'react-use';
import { ImageCard } from '../ImageCard';
import { RelationshipCountTag } from './RelationshipCountTag';
import { type UseImageCardsRelationshipDataReturnValue, useRandomCards } from './hooks/hooks';

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

      <PasscodeWords />

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

const bank: Record<string, string[]> = {};

function PasscodeWords() {
  const { data, isLoading } = useLoadWordLibrary(3, 'pt', true, true);
  const [input, setInput] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);

  const onGetWords = () => {
    if (!isEmpty(data) && isEmpty(bank)) {
      data.forEach((word) => {
        word.split('').forEach((letter) => {
          if (!bank[letter.toLowerCase()]) {
            bank[letter.toLowerCase()] = [word];
          } else {
            bank[letter.toLowerCase()].push(word);
          }
        });
      });
    }

    const result = input
      .split('')
      .map((letter) => {
        return sample(bank[letter.toLowerCase()]);
      })
      .filter(Boolean) as string[];

    setWords(result);
  };

  return (
    <>
      <Typography.Title level={3} className="center">
        Passcode Words
      </Typography.Title>

      <Flex>
        <Input onChange={(e) => setInput(e.target.value)} />
        <Button disabled={isLoading || input.length === 0} onClick={onGetWords}>
          Get
        </Button>
      </Flex>

      <Input.TextArea className="mt-4" value={JSON.stringify(words)} />
    </>
  );
}
