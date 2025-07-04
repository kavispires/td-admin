import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import stringSimilarity from 'string-similarity';
import type { DailyMovieSet, Item as ItemT } from 'types';
import { ItemsTypeahead } from '../ItemsTypeahead';

type AddItemFlowProps = {
  movie: DailyMovieSet;
  addEntryToUpdate: (id: string, item: DailyMovieSet) => void;
};

export function AddItemFlow({ movie, addEntryToUpdate }: AddItemFlowProps) {
  const onUpdate = (itemId: string) => {
    addEntryToUpdate(movie.id, {
      ...movie,
      itemsIds: [...movie.itemsIds, itemId],
    });
  };

  return (
    <Flex gap={12}>
      <div style={{ minWidth: 250 }}>
        <ItemsTypeahead onFinish={onUpdate} />
      </div>
      <Divider type="vertical" variant="dotted" />
      <ItemsSuggestions movie={movie} onUpdate={onUpdate} />
    </Flex>
  );
}

type ItemsSuggestionsProps = {
  movie: DailyMovieSet;
  onUpdate: (itemId: string) => void;
};

function ItemsSuggestions({ movie, onUpdate }: ItemsSuggestionsProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items', true);

  const suggestions: string[] = useMemo(() => {
    if (!itemsTypeaheadQuery.data) return [];

    const title = movie.title.toLowerCase();
    const itemsArray = Object.entries(itemsTypeaheadQuery.data);
    const matches: Array<{ id: string; similarity: number }> = [];

    // Check similarity for each item's name and aliases
    itemsArray.forEach(([id, item]) => {
      // Skip if item is already in the movie
      if (movie.itemsIds.includes(id)) return;

      // Get all possible text matches (Portuguese name and aliases)
      const textsToMatch = [item.name.pt.toLowerCase()];

      // Add aliases if available
      if (item.aliasesPt && Array.isArray(item.aliasesPt)) {
        textsToMatch.push(...item.aliasesPt.map((alias) => alias.toLowerCase()));
      }

      // Find best match using findBestMatch which is more efficient for multiple comparisons
      const matchResult = stringSimilarity.findBestMatch(title, textsToMatch);
      const bestMatch = matchResult.bestMatch.rating;

      // If similarity is above threshold, add to matches
      if (bestMatch > 0.3) {
        matches.push({ id, similarity: bestMatch });
      }
    });

    // Sort by similarity (highest first) and limit to top 20
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20)
      .map((match) => match.id);
  }, [itemsTypeaheadQuery.data, movie]);

  return (
    <Flex gap={12} vertical>
      <Typography.Text strong>Suggestions</Typography.Text>
      <Flex gap={16} wrap="wrap">
        {suggestions.map((itemId, index) => {
          const item = itemsTypeaheadQuery.data?.[itemId];
          return (
            <Flex gap={2} key={`sample-${itemId}-${index}`} vertical>
              <Item id={itemId} title={`${item.name.en} | ${item.name.pt}`} width={60} />
              <Flex gap={6} justify="center">
                <Typography.Text>{itemId}</Typography.Text>
                <Button onClick={() => onUpdate(itemId)} shape="circle" size="small">
                  <PlusOutlined />
                </Button>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
