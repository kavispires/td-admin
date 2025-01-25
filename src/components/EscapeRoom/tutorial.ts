import type { EscapeRoomEpisode } from './types';

export const TUTORIAL: EscapeRoomEpisode = {
  id: 'ere-0-en',
  language: 'en',
  title: 'Tutorial',
  difficulty: 'basic',
  total: 1,
  missions: {},
  cards: {
    'erc-1': {
      id: 'erc-1',
      type: 'mission',
      content: {
        number: 1,
        title: 'Instructions',
        subtitle: 'The rules of Escape Room are simple:',
        paragraphs: [
          'A deck of cards is shuffled and distributed among all players.',
          'The game starts by reading out loud the Mission #1 card (this one).',
          'Players must complete missions by playing the correct card(s) on the table.',
          'Players may share anything on their cards unless the card says otherwise.',
          'Click on the arrow on its top-right corner to play the card, but once a card is played, it cannot be taken back.',
          'And once players believe they completed the mission, they must play one of the “Complete Mission” cards.',
          'The game ends when all missions are completed or when the time runs out.',
          'For this tutorial, figure out the code. Good luck!',
        ],
      },
    },
    'erc-2': {
      id: 'erc-2',
      type: 'complete-mission',
      content: null,
    },
    'erc-3': {
      id: 'erc-3',
      type: 'text',
      content: {
        spriteId: 'note',
        text: 'Start with something that represents love followed by the most fruit.',
      },
    },
    'erc-4': {
      id: 'erc-4',
      type: 'item',
      content: {
        itemId: '1988',
      },
    },
    'erc-5': {
      id: 'erc-5',
      type: 'item',
      content: {
        itemId: '14',
        name: 'Strawberry',
      },
    },
    'erc-6': {
      id: 'erc-6',
      type: 'item',
      content: {
        itemId: '90',
        name: 'Banana',
      },
    },
    'erc-7': {
      id: 'erc-7',
      type: 'item',
      content: {
        itemId: '1858',
        name: 'Apple',
      },
    },
    'erc-8': {
      id: 'erc-8',
      type: 'item',
      content: {
        itemId: '621',
        name: 'Orange',
      },
    },
    'erc-9': {
      id: 'erc-9',
      type: 'item',
      content: {
        itemId: '125',
        name: 'Pineapple',
      },
    },
  },
  updatedAt: Date.now(),
  ready: false,
};

// console.log(JSON.stringify({ 'ere-0-en': TUTORIAL }, null, 2));
console.log({ 'ere-0-en': TUTORIAL });
