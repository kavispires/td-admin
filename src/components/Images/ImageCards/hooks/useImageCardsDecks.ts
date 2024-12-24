import { useTDResource } from 'hooks/useTDResource';
import { isEmpty, random, sample } from 'lodash';

export function useImageCardsDecks() {
  const tdrImagesDecksQuery = useTDResource<number>('images-decks');
  const decks = tdrImagesDecksQuery.data ?? {};

  const onRandomCard = () => {
    if (isEmpty(decks)) return 'td-d0-00';

    const randomDeckNumber = sample(Object.keys(decks));
    if (!randomDeckNumber) return 'td-d0-00';
    const randomCardNumber = random(1, decks[randomDeckNumber]);
    console.log({ randomDeckNumber, randomCardNumber });
    return `${randomDeckNumber}-${randomCardNumber.toString().padStart(2, '0')}`;
  };

  const onRandomUniqueCard = (usedCards: string[]) => {
    const randomCard: string | null = null;
    let tries = 0;

    while (!randomCard && tries < 30) {
      const randomCard = onRandomCard();
      if (usedCards.includes(randomCard)) {
        tries++;
        continue;
      }
      return randomCard;
    }

    if (tries > 30) {
      throw new Error('Could not find a unique card');
    }
  };

  const onRandomCards = (quantity = 10) => {
    const randomCards: string[] = [];
    let tries = 0;
    while (Object.keys(randomCards).length < quantity && tries < 30) {
      const randomCard = onRandomCard();
      if (randomCards.includes(randomCard)) {
        tries++;
        continue;
      }
      randomCards.push(randomCard);
      tries - 0;
    }
    if (tries > 30 && randomCards.length < quantity) {
      throw new Error('Could not find enough unique cards');
    }

    return randomCards;
  };

  return {
    ...tdrImagesDecksQuery,
    decks,
    decksList: Object.keys(decks),
    onRandomCard,
    onRandomUniqueCard,
    onRandomCards,
  };
}
