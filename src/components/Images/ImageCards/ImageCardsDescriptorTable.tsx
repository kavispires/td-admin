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
    (!entry.keywords || entry.keywords.length === 0) &&
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
  const { addParam } = useQueryParams();
  const { message } = App.useApp();

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
      keywords: [],
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

  const columns: TableProps<ImageCardDescriptor>['columns'] = [
    {
      title: 'CardId',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => sortCardIds(a.id, b.id),
      render: (id: string) => <IdTag>{id}</IdTag>,
    },
    {
      title: 'Image',
      dataIndex: 'id',
      key: 'image',
      render: (id: string) => (
        <Button onClick={() => addParam('cardId', id)} style={{ padding: 0, height: 'auto' }} type="link">
          <ImageCard cardId={id} cardWidth={50} preview={false} />
        </Button>
      ),
    },
    {
      title: 'Favorite',
      dataIndex: 'favorite',
      key: 'favorite',
      sorter: (a, b) => (a.favorite ? 1 : 0) - (b.favorite ? 1 : 0),
      render: (_, record) => (
        <FavoriteImageCardButton addEntryToUpdate={addEntryToUpdate} imageCard={record} />
      ),
    },
    {
      title: 'Title (EN)',
      dataIndex: ['title', 'en'],
      key: 'title-en',
      sorter: (a, b) => (a.title?.en || '').localeCompare(b.title?.en || ''),
      render: (titleEn: string, record) => (
        <Flex gap={6}>
          <LanguageFlag language="en" />
          <Typography.Text
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
            {titleEn || '?'}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'Title (PT)',
      dataIndex: ['title', 'pt'],
      key: 'title-pt',
      sorter: (a, b) => (a.title?.pt || '').localeCompare(b.title?.pt || ''),
      render: (titlePt: string, record) => (
        <Flex gap={6}>
          <LanguageFlag language="pt" />
          <Typography.Text
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
            {titlePt || '?'}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'Keywords',
      dataIndex: 'keywords',
      key: 'keywords',
      sorter: (a, b) => (a.keywords?.length || 0) - (b.keywords?.length || 0),
      render: (keywords: string[]) => (
        <>
          {keywords?.join(', ') || ''}
          {keywords?.length > 0 && <Tag style={{ marginLeft: 8 }}>{keywords.length}</Tag>}
        </>
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
  ];

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  return (
    <div className="image-cards-descriptor-table-wrapper">
      <Table columns={columns} dataSource={rows} pagination={paginationProps} rowKey="id" />
    </div>
  );
}
