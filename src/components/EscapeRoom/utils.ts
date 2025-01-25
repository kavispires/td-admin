import { CARD_TYPES, type EscapeRoomCardType } from './types';

export const generateCardId = (totalCards: number, language: Language = 'en') =>
  `erc-${totalCards + 1}-${language}`;

export const generateCard = (type: EscapeRoomCardType['type']): EscapeRoomCardType => {
  switch (type) {
    case CARD_TYPES.MISSION:
      return {
        id: '',
        type: CARD_TYPES.MISSION,
        variant: 'default',
        unplayable: false,
        filler: false,
        content: {
          number: 0,
          title: '',
          paragraphs: [],
        },
      };
    case CARD_TYPES.TEXT:
      return {
        id: '',
        type: CARD_TYPES.TEXT,
        variant: 'default',
        unplayable: false,
        filler: false,
        content: {
          text: '',
        },
      };
    case CARD_TYPES.ITEM:
      return {
        id: '',
        type: CARD_TYPES.ITEM,
        variant: 'default',
        unplayable: false,
        filler: false,
        content: {
          itemId: '',
          name: '',
        },
      };
    case CARD_TYPES.ITEM_COLLECTION:
      return {
        id: '',
        type: CARD_TYPES.ITEM_COLLECTION,
        variant: 'default',
        unplayable: false,
        filler: false,
        content: {
          itemsIds: [],
          pattern: '',
          backgroundColor: '',
        },
      };
    default:
      throw new Error(`Card type ${type} not implemented`);
  }
};
