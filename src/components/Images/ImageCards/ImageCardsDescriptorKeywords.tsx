import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import { useTablePagination } from '@hooks/useTablePagination';
import type { ImageCardDescriptorData } from '@types';
import { Button, Flex, Table, type TableProps, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { ImageCard } from '../ImageCard';
import './ImageCardsDescriptorTable.css';
import { DownloadButton } from '@components/Common/DownloadButton';
import { IdTag } from '@components/Common/IdTag';
import { PageContent } from '@components/Common/PageContent';
import { VirtualizationWrapper } from '@components/Common/VirtualizationWrapper';
import { orderBy, uniq } from 'lodash';

type KeywordGroup = {
  keyword: string;
  cardsIds: UID[];
};

export function ImageCardsDescriptorKeywords({
  data,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>) {
  const { queryParams } = useQueryParams();
  const language = (queryParams.get('language') || 'en') as Language;

  // Group image cards by keywords for the selected language
  const groupedByKeywordsRows = useMemo(() => {
    const groups: Record<string, KeywordGroup> = {};

    Object.values(data).forEach((card) => {
      if (!(card?.keywords?.[language]?.trim().length > 0)) return; // Skip if no keywords for the selected language

      const keywords = card.keywords[language]
        .split(',')
        .map((k) => k.trim().toLocaleLowerCase())
        .flatMap((k) => k.split(' '))
        .filter((k) => k.length > 2);
      keywords.forEach((keyword) => {
        // Verify plurals
        let key = keyword;
        if (!groups[key] && (key.endsWith('as') || key.endsWith('os'))) {
          key = key.slice(0, -1);
        }

        // If language is pt and it ands with a or o, and the same word ending with the opposite is already in the groups, use that one instead
        if (language === 'pt') {
          const opposite = `${key.slice(0, -1)}${key.endsWith('a') ? 'o' : 'a'}`;
          // If feminine and opposite exists, use that
          if (key.endsWith('a') && groups[opposite]) {
            console.log(`Using opposite ${opposite} for: ${key}`);
            key = opposite;
            // If masculine and opposite exists, replace it
          } else if (key.endsWith('o') && groups[opposite]) {
            if (!groups[key]) {
              groups[key] = { keyword: key, cardsIds: [] };
            }

            groups[key].cardsIds.push(...groups[opposite].cardsIds);
            delete groups[opposite];
            console.log(`Replacing opposite ${key} for: ${opposite}`);
          }
        }

        if (!groups[key]) {
          groups[key] = { keyword: key, cardsIds: [] };
        }
        groups[key].cardsIds.push(card.id);
      });
    });

    return orderBy(
      Object.values(groups).map((group) => ({
        ...group,
        cardsIds: uniq(group.cardsIds),
      })),
      [(o) => o.cardsIds.length],
      ['desc'],
    );
  }, [data, language]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: No functions as dependencies
  const columns: TableProps<KeywordGroup>['columns'] = useMemo(
    () => [
      {
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        sorter: (a, b) => a.keyword.localeCompare(b.keyword),
      },
      {
        title: 'Cards',
        dataIndex: 'cardsIds',
        key: 'cardsIds',
        sorter: (a, b) => a.cardsIds.length - b.cardsIds.length,
        render: (cardsIds: string[]) => <CardsRowContent cardsIds={cardsIds} />,
      },
    ],
    [data, language],
  );

  const paginationProps = useTablePagination({ total: groupedByKeywordsRows.length, showQuickJumper: true });

  return (
    <PageContent className="image-cards-descriptor-table-wrapper">
      <Flex
        align="center"
        justify="space-between"
      >
        <Typography.Title
          className="my-0"
          level={4}
        >
          Cards by Keywords
        </Typography.Title>
        <DownloadButton
          data={() => groupedByKeywordsRows.map((row) => row.keyword).sort((a, b) => a.localeCompare(b))}
          fileName={'image-cards-descriptions-keywords.json'}
        >
          Download Keywords
        </DownloadButton>
      </Flex>
      <Table
        columns={columns}
        dataSource={groupedByKeywordsRows}
        pagination={paginationProps}
        rowKey="keyword"
      />
    </PageContent>
  );
}

type CardsRowContentProps = {
  cardsIds: UID[];
};

const THRESHOLD = 10; // Number of cards to show before "See All" button appears

function CardsRowContent({ cardsIds }: CardsRowContentProps) {
  const [seeAll, setSeeAll] = useState(false);

  const displayedCardsIds = seeAll ? cardsIds : cardsIds.slice(0, THRESHOLD);

  return (
    <Flex
      align="center"
      gap={12}
      wrap
    >
      {displayedCardsIds.map((cardId: string) => (
        <Flex
          align="center"
          gap={4}
          key={cardId}
          vertical
        >
          <VirtualizationWrapper
            key={cardId}
            width={64}
          >
            <ImageCard
              cardId={cardId}
              cardWidth={64}
            />
          </VirtualizationWrapper>
          <div>
            <IdTag>{cardId}</IdTag>
          </div>
        </Flex>
      ))}
      {cardsIds.length > THRESHOLD && (
        <Button
          onClick={() => setSeeAll(!seeAll)}
          type="link"
        >
          {seeAll ? 'See Less' : 'See All'}
        </Button>
      )}
    </Flex>
  );
}
