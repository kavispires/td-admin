import { sortBy } from 'lodash';
import { useEffect, useState } from 'react';
import { CrimesHediondosCard } from 'types';

type TagsDict = Record<Tag, CardId[]>;
type CardsDict = Record<CardId, Tag[]>;

export function useCrimesHediondosTags(data: CrimesHediondosCard[]) {
  const [tags, setTags] = useState<TagsDict>({});
  const [cards, setCards] = useState<CardsDict>({});

  useEffect(() => {
    const selectedCards: CardsDict = {};

    data.forEach((card) => {
      selectedCards[card.id] = card.tags ?? [];
    });

    setCards(selectedCards);
  }, [data]);

  useEffect(() => {
    const selectedTags: TagsDict = {};

    Object.entries(cards).forEach(([cardId, cardTags]) => {
      cardTags.forEach((entryTag) => {
        if (selectedTags[entryTag] === undefined) {
          selectedTags[entryTag] = [];
        }
        selectedTags[entryTag].push(cardId);
      });
    });

    setTags(selectedTags);
  }, [cards]);

  const addTagToCard = (cardId: CardId, tag: Tag) => {
    setCards((prevState) => {
      const newState = { ...prevState };

      const entry = [...newState[cardId]];
      const index = entry.indexOf(tag);
      if (index === -1) {
        entry.push(tag);
      } else {
        entry.splice(index, 1);
      }
      newState[cardId] = entry;

      return newState;
    });
  };

  const updateCardTags = (cardId: CardId, cardTags: Tag[]) => {
    setCards((prevState) => {
      const newState = { ...prevState };
      newState[cardId] = cardTags;

      return newState;
    });
  };

  const prepareJson = () => {
    const weapons: Record<CardId, CrimesHediondosCard> = {};
    const evidence: Record<CardId, CrimesHediondosCard> = {};

    data.forEach((card) => {
      if (card.type === 'weapon') {
        weapons[card.id] = {
          ...card,
          tags: cards[card.id],
        };
      } else {
        evidence[card.id] = {
          ...card,
          tags: cards[card.id],
        };
      }
    });

    return {
      weapons,
      evidence,
    };
  };

  return {
    tags,
    tagsArr: sortBy(Object.keys(tags)),
    cards,
    addTagToCard,
    updateCardTags,
    prepareJson,
  };
}
