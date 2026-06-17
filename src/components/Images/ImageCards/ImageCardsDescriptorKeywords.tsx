import { Flex, Table, type TableProps } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo } from 'react';
import type { ImageCardDescriptor } from 'types';
import { ImageCard } from '../ImageCard';
import './ImageCardsDescriptorTable.css';
import { IdTag } from 'components/Common/IdTag';
import { PageContent } from 'components/Common/PageContent';
import { VirtualizationWrapper } from 'components/Common/VirtualizationWrapper';
import { uniq } from 'lodash';

type KeywordGroup = {
  keyword: string;
  cardsIds: UID[];
};

export function ImageCardsDescriptorKeywords({
  data,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
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

    return Object.values(groups).map((group) => ({
      ...group,
      cardsIds: uniq(group.cardsIds),
    }));
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
        render: (cardsIds: string[]) => (
          <Flex gap={12} wrap>
            {cardsIds.map((cardId: string) => (
              <Flex align="center" gap={4} key={cardId} vertical>
                <VirtualizationWrapper key={cardId} width={64}>
                  <ImageCard cardId={cardId} cardWidth={64} />
                </VirtualizationWrapper>
                <div>
                  <IdTag>{cardId}</IdTag>
                </div>
              </Flex>
            ))}
          </Flex>
        ),
      },
    ],
    [data, language],
  );

  const paginationProps = useTablePagination({ total: groupedByKeywordsRows.length, showQuickJumper: true });
  console.log('K render');
  return (
    <PageContent className="image-cards-descriptor-table-wrapper">
      <Table
        columns={columns}
        dataSource={groupedByKeywordsRows}
        pagination={paginationProps}
        rowKey="keyword"
      />
    </PageContent>
  );
}
