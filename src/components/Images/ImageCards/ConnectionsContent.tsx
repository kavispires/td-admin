import { Flex, Space, Table, Tag } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { memoize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { useMeasure } from 'react-use';

import { RightCircleFilled } from '@ant-design/icons';

import { ImageCard } from '../ImageCard';
import { UseImageCardsRelationshipDataReturnValue } from './hooks';
import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';

export function ConnectionsContent() {
  const {
    query: { isDirty, isSaving, save, stats, data, ...query },
    randomGroups: { cardIds },
    showIds,
    cardSize,
  } = useImagesRelationshipsContext();

  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const [, cardWidth] = useMemo(() => {
    const cq = Math.floor(containerWidth / cardSize) + 1;
    const cw = Math.floor(containerWidth / cq);
    return [cq, cw];
  }, [cardSize, containerWidth]);

  const columns = [
    {
      title: 'Length',
      dataIndex: 'length',
      key: 'length',
    },
    {
      title: 'Relationships',
      dataIndex: 'relationships',
      key: 'relationship',
      render: (relatedCards: CardId[], row: any) => (
        <Flex wrap="wrap" gap={2}>
          {relatedCards.map((cardId) => (
            <Space key={`${row.origin}-${cardId}`}>
              <Space direction="vertical">
                <ImageCard id={cardId} width={cardWidth} />
                {showIds && <Tag>{cardId}</Tag>}
              </Space>
              {relatedCards[relatedCards.length - 1] !== cardId && <RightCircleFilled />}
            </Space>
          ))}
        </Flex>
      ),
    },
  ];

  const dataSource = useMemo(() => {
    return orderBy(
      cardIds.map((id: string) => {
        const path = getConnectionsPath(id, data, 'longest', 10);
        return {
          key: id,
          origin: id,
          length: path.length,
          relationships: path,
        };
      }),
      ['length'],
      ['desc']
    );
  }, [cardIds, data]);

  console.log(dataSource);

  return (
    <DataLoadingWrapper isLoading={query.isLoading} error={query.error} hasResponseData={true}>
      <div ref={ref} className="my-6">
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </DataLoadingWrapper>
  );
}

type PathType = 'shortest' | 'longest' | 'any';

const getConnectionsPath = memoize(
  (
    originId: CardId,
    data: UseImageCardsRelationshipDataReturnValue['data'],
    type: PathType,
    maxPathLength: number
  ) => {
    const visited: Set<CardId> = new Set();
    const stack: { currentId: CardId; path: CardId[]; depth: number }[] = [];
    let resultPath: CardId[] = [];
    let iterations = 0;

    stack.push({ currentId: originId, path: [], depth: 0 });

    while (stack.length > 0 && iterations < 100) {
      iterations++;

      const { currentId, path, depth } = stack.pop()!;

      visited.add(currentId);
      path.push(currentId);

      if (type === 'longest' && path.length > resultPath.length) {
        resultPath = [...path];
      }

      if (type === 'shortest' && (resultPath.length === 0 || path.length < resultPath.length)) {
        resultPath = [...path];
      }

      if (type === 'any' && resultPath.length === 0) {
        resultPath = [...path];
      }

      if (depth >= maxPathLength) {
        // Reached the depth limit, continue to the next iteration
        continue;
      }

      // Push unvisited neighbors onto the stack
      for (const neighborId of data[currentId] || []) {
        if (!visited.has(neighborId)) {
          stack.push({ currentId: neighborId, path: [...path], depth: depth + 1 });
        }
      }
    }

    return resultPath;
  }
);
