import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Flex, Popconfirm, Table, type TableProps, Tag, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo } from 'react';
import type { ImageCardDescriptor } from 'types';
import { ImageCard } from '../ImageCard';
import { FavoriteImageCardButton } from './ImageCardsDescriptorModal';
import './ImageCardsDescriptorTable.css';
import { IdTag } from 'components/Common/IdTag';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { PageContent } from 'components/Common/PageContent';

/**
 * Parses a card ID into its components
 * @param cardId - Card ID (e.g., 'td-d1-123')
 * @returns Object with prefix and number
 */
function parseCardId(cardId: string): { prefix: string; number: number } {
  const match = cardId.match(/^(td-d\d+)-(\d+)$/);
  if (!match) return { prefix: cardId, number: 0 };
  return { prefix: match[1], number: Number.parseInt(match[2], 10) };
}

/**
 * Sorts card IDs numerically by deck and card number
 * @param a - First card ID
 * @param b - Second card ID
 * @returns Sort comparison result
 */
function sortCardIds(a: string, b: string): number {
  const parsedA = parseCardId(a);
  const parsedB = parseCardId(b);

  // First sort by prefix (deck)
  const prefixCompare = parsedA.prefix.localeCompare(parsedB.prefix);
  if (prefixCompare !== 0) return prefixCompare;

  // Then sort by number
  return parsedA.number - parsedB.number;
}

/**
 * Parses a card ID and generates the next sequential ID
 * @param cardId - Current card ID (e.g., 'td-d1-123')
 * @returns Next card ID (e.g., 'td-d1-124')
 */
function getNextCardId(cardId: string): string {
  const match = cardId.match(/^(td-d\d+)-(\d+)$/);
  if (!match) return cardId;

  const [, prefix, numberStr] = match;
  const nextNumber = Number.parseInt(numberStr, 10) + 1;
  return `${prefix}-${nextNumber.toString().padStart(numberStr.length, '0')}`;
}

/**
 * Parses a card ID and generates the previous sequential ID
 * @param cardId - Current card ID (e.g., 'td-d1-123')
 * @returns Previous card ID (e.g., 'td-d1-122')
 */
function getPreviousCardId(cardId: string): string {
  const match = cardId.match(/^(td-d\d+)-(\d+)$/);
  if (!match) return cardId;

  const [, prefix, numberStr] = match;
  const prevNumber = Number.parseInt(numberStr, 10) - 1;
  if (prevNumber < 0) return cardId;
  return `${prefix}-${prevNumber.toString().padStart(numberStr.length, '0')}`;
}

/**
 * Checks if a card is the first in its deck (ends with -01)
 */
function isFirstCardInDeck(cardId: string): boolean {
  return cardId.endsWith('-01');
}

/**
 * Checks if a card is the last in its deck (ends with -255 or other max number)
 */
function isLastCardInDeck(cardId: string): boolean {
  return cardId.endsWith('-255');
}

/**
 * Checks if an image card descriptor is empty (no meaningful data)
 */
function isEmptyEntry(entry: ImageCardDescriptor): boolean {
  return (
    !entry.title?.en &&
    !entry.title?.pt &&
    !entry.description?.en &&
    !entry.description?.pt &&
    !entry.keywords?.en &&
    !entry.keywords?.pt &&
    (!entry.triggers || entry.triggers.length === 0) &&
    (!entry.associatedDreams || entry.associatedDreams.length === 0) &&
    !entry.favorite
  );
}

export function ImageCardsDescriptorTable({
  data,
  addEntryToUpdate,
  firestoreData,
  entriesToUpdate,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
  const { addParam, queryParams } = useQueryParams();
  const { message } = App.useApp();
  const language = (queryParams.get('language') || 'en') as Language;

  const rows = useMemo(
    () =>
      Object.values(data)
        .filter((entry): entry is ImageCardDescriptor => entry !== null && entry !== undefined)
        .sort((a, b) => sortCardIds(a.id, b.id)),
    [data],
  );

  const handleInsertEntry = (currentCardId: string, position: 'before' | 'after') => {
    const newCardId = position === 'after' ? getNextCardId(currentCardId) : getPreviousCardId(currentCardId);

    // Check if the new card already exists
    if (data[newCardId]) {
      message.warning(`Entry ${newCardId} already exists`);
      return;
    }

    // Create an empty entry
    const newEntry: ImageCardDescriptor = {
      id: newCardId,
      title: { en: '', pt: '' },
      description: { en: '', pt: '' },
      keywords: { en: '', pt: '' },
    };

    addEntryToUpdate(newCardId, newEntry);
    message.success(`Created new entry: ${newCardId}. Click Edit to add details.`);
  };

  const handleDeleteEntry = (cardId: string) => {
    const entry = data[cardId];
    if (!isEmptyEntry(entry)) {
      message.error('Can only delete entries with no data');
      return;
    }

    // Check if this is a newly created entry (exists in modified entries but not in original firestore data)
    const existsInOriginalData = firestoreData?.[cardId];

    if (!existsInOriginalData && entriesToUpdate[cardId]) {
      // This is a newly created entry that hasn't been saved yet
      // We need to "undo" its creation by removing it from the update queue
      // Since we don't have direct access to setModifiedEntries, we'll mark it for deletion
      // by setting null/undefined which Firebase interprets as deletion
      addEntryToUpdate(cardId, null as unknown as ImageCardDescriptor);
      message.success(`Removed new entry: ${cardId}`);
    } else if (!existsInOriginalData) {
      message.warning(`Entry ${cardId} doesn't exist in the database`);
    } else {
      message.error(
        'Cannot delete entries that exist in the database. This feature is only for newly created entries.',
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: No functions as dependencies
  const columns: TableProps<ImageCardDescriptor>['columns'] = useMemo(
    () => [
      {
        title: 'CardId',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => sortCardIds(a.id, b.id),
        render: (id: string, record) => (
          <Flex vertical>
            <IdTag>{id}</IdTag>
            <Button onClick={() => addParam('cardId', id)} style={{ padding: 0, height: 'auto' }} type="link">
              <ImageCard cardId={id} cardWidth={50} preview={false} />
            </Button>
            <FavoriteImageCardButton addEntryToUpdate={addEntryToUpdate} imageCard={record} />
          </Flex>
        ),
      },
      {
        title: 'Title',
        dataIndex: ['title', language],
        key: 'title',
        sorter: (a, b) => (a.title?.[language] || '').localeCompare(b.title?.[language] || ''),
        render: (_, record: ImageCardDescriptor) => (
          <Flex gap={4} vertical>
            <Flex gap={6}>
              <LanguageFlag language="en" />
              <Typography.Text
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.title?.en || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        title: { ...record.title, en: value },
                      });
                    }
                  },
                }}
              >
                {record.title?.en || '-'}
              </Typography.Text>
            </Flex>
            <Flex gap={6}>
              <LanguageFlag language="pt" />
              <Typography.Text
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.title?.pt || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        title: { ...record.title, pt: value },
                      });
                    }
                  },
                }}
              >
                {record.title?.pt || '-'}
              </Typography.Text>
            </Flex>
          </Flex>
        ),
      },
      {
        title: 'Description',
        dataIndex: ['description', language],
        key: 'description',
        render: (_, record) => (
          <Flex gap={4} vertical>
            <Flex gap={6}>
              <LanguageFlag language="en" />
              <Typography.Paragraph
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.description?.en || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        description: { ...record.description, en: value },
                      });
                    }
                  },
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {record.description?.en || '-'}
              </Typography.Paragraph>
            </Flex>
            <Flex gap={6}>
              <LanguageFlag language="pt" />
              <Typography.Paragraph
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.description?.pt || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        description: { ...record.description, pt: value },
                      });
                    }
                  },
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {record.description?.pt || '-'}
              </Typography.Paragraph>
            </Flex>
          </Flex>
        ),
      },
      {
        title: 'Keywords',
        dataIndex: ['keywords', language],
        key: 'keywords',
        render: (_, record) => (
          <Flex gap={4} vertical>
            <Flex gap={6}>
              <LanguageFlag language="en" />
              <Typography.Paragraph
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.keywords?.en || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        keywords: { ...record.keywords, en: value },
                      });
                    }
                  },
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {record.keywords?.en || '-'}
              </Typography.Paragraph>
            </Flex>
            <Flex gap={6}>
              <LanguageFlag language="pt" />
              <Typography.Paragraph
                copyable
                editable={{
                  onChange: (value) => {
                    if (value !== (record.keywords?.pt || '')) {
                      addEntryToUpdate(record.id, {
                        ...record,
                        keywords: { ...record.keywords, pt: value },
                      });
                    }
                  },
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {record.keywords?.pt || '-'}
              </Typography.Paragraph>
            </Flex>
          </Flex>
        ),
      },
      {
        title: 'Associated Dreams',
        dataIndex: 'associatedDreams',
        key: 'associatedDreams',
        sorter: (a, b) => (a.associatedDreams?.length || 0) - (b.associatedDreams?.length || 0),
        render: (associatedDreams: string[]) => (
          <>
            {associatedDreams?.join(', ') || '-'}
            {associatedDreams?.length > 0 && <Tag style={{ marginLeft: 8 }}>{associatedDreams.length}</Tag>}
          </>
        ),
      },
      {
        title: 'Triggers',
        dataIndex: 'triggers',
        key: 'triggers',
        sorter: (a, b) => (a.triggers?.length || 0) - (b.triggers?.length || 0),
        render: (triggers: string[], record) => {
          const isFirst = isFirstCardInDeck(record.id);
          const isLast = isLastCardInDeck(record.id);
          const previousCardId = getPreviousCardId(record.id);
          const nextCardId = getNextCardId(record.id);
          const previousCardExists = data[previousCardId];
          const nextCardExists = data[nextCardId];

          return (
            <>
              <div className="floating-insert-buttons">
                {!isFirst && !previousCardExists && (
                  <Button
                    className="insert-button-top"
                    icon={<PlusOutlined />}
                    onClick={() => handleInsertEntry(record.id, 'before')}
                    size="small"
                    title={`Insert ${previousCardId} before this card`}
                  >
                    Insert {previousCardId}
                  </Button>
                )}
                {!isLast && !nextCardExists && (
                  <Button
                    className="insert-button-bottom"
                    icon={<PlusOutlined />}
                    onClick={() => handleInsertEntry(record.id, 'after')}
                    size="small"
                    title={`Insert ${nextCardId} after this card`}
                  >
                    Insert {nextCardId}
                  </Button>
                )}
              </div>
              <div>
                {triggers?.join(', ') || ''}
                {isEmptyEntry(record) && (
                  <Popconfirm onConfirm={() => handleDeleteEntry(record.id)} title="Delete this empty entry?">
                    <Button danger icon={<DeleteOutlined />} size="small" style={{ marginLeft: 8 }}>
                      Delete
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </>
          );
        },
      },
    ],
    [data, language],
  );

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  return (
    <PageContent className="image-cards-descriptor-table-wrapper">
      <Table columns={columns} dataSource={rows} pagination={paginationProps} rowKey="id" />
    </PageContent>
  );
}
