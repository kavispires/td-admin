// Internal
import type { EscapeRoomCardType, MissionBriefing } from './escape-room-types';

export const DEMO_MISSION: MissionBriefing = {
  id: 'er-mission-01',
  number: 1,
  missionId: 'er-ms-01',
  name: 'Um simples começo',
  level: 1,
  cardsIds: [],
  solution: {
    cardsIds: [],
    type: 'ordered',
  },
};

export const DEMO_CARDS_DICT: Dictionary<EscapeRoomCardType> = {
  'er-ms-01': {
    id: 'er-ms-01',
    type: 'mission',
    doc: 'mission play facinho (TODO: all 5 variants)',
    number: 1,
    name: 'Um simples começo',
    content: [
      { pos: 1, type: 'title', text: 'Um simples começo', size: 'large', align: 'center' },
      { pos: 14, type: 'text-box', text: 'O resultado dessa missão é **facinho**.', variant: 'contained' },
    ],
  },
  'er-com-ms': {
    id: 'er-com-ms',
    type: 'complete-mission',
    doc: 'complete mission card',
    content: [],
  },
  'er-ms-hp': {
    id: 'er-ms-hp',
    type: 'help',
    doc: 'help card',
    content: [],
  },
};

export const DEMO_HAND = Object.keys(DEMO_CARDS_DICT);

export const DEMO = {
  id: 'ep-demo-001',
  language: 'en',
  title: 'Escape Room Demo Episode',
  total: 3,
  difficulty: 'medium',
  missions: [
    {
      id: 'm1-01',
      number: 1,
      missionId: 'er-mission-01',
      name: 'Mission One',
      level: 2,
      cardsIds: [
        'er-mission-01',
        'er-content-01',
        'er-content-02',
        'er-content-03',
        'er-content-04',
        'er-content-05',
        'er-complete-01',
      ],
      solution: {
        cardsIds: ['er-content-01'],
        type: 'ordered',
        message: "Well done! You've completed Mission One.",
        fillersIds: ['er-filler-01', 'er-filler-02'],
      },
    },
  ],
  cards: {
    'er-mission-01': {
      id: 'er-mission-01',
      type: 'mission',
      doc: 'examples: title, text-box, label',
      number: 1,
      name: 'Mission One',
      content: [
        { type: 'title', text: 'Mission One', size: 'large', align: 'center' },
        { type: 'text-box', text: 'Find the correct sequence.', variant: 'contained' },
        { type: 'text-box', text: 'Find the **correct** sequence with more text\n\nAnd *more* text.' },
      ],
    },
    'er-content-01': {
      id: 'er-content-01',
      type: 'content',
      doc: 'examples: image-card, audio',
      content: [
        { type: 'image-card', cardId: 'td-d1-01', scale: 2 },
        { type: 'audio', url: 'https://example.com/audio.mp3' },
        {
          type: 'image-card-sequence',
          cardIds: ['td-d2-01', 'td-d3-01', 'td-d4-01', 'td-d5-01', 'td-d6-01'],
        },
      ],
    },
    'er-content-02': {
      id: 'er-content-02',
      type: 'content',
      doc: 'examples: sprites',
      content: [
        { type: 'sprite', library: 'items', spriteId: '1' },
        { type: 'sprite', library: 'alien-signs', spriteId: '1' },
        { type: 'sprite', library: 'emojis', spriteId: '1' },
        { type: 'sprite', library: 'glyphs', spriteId: '1' },
        { type: 'sprite', library: 'warehouse-goods', spriteId: '2' },
      ],
    },
    'er-content-02b': {
      id: 'er-content-02b',
      type: 'content',
      doc: 'examples: sprite, voice',
      content: [
        { type: 'sprite-sequence', library: 'items', spriteIds: ['4', '2', '3', '10', '12'] },
        { type: 'sprite-grid', library: 'alien-signs', spriteIds: ['5', '6', '7', '8'] },
      ],
    },
    'er-content-03': {
      id: 'er-content-03',
      type: 'content',
      doc: 'examples: calendar, codex',
      content: [
        { type: 'calendar', startAt: 1, totalDays: 30, highlights: [5, 10, 15], highlightsColor: 'red' },
        { type: 'codex', table: ['A', '1', 'B', '2', 'C', '3'] },
        { type: 'voice', text: 'Listen carefully.', iconId: 'mic-icon' },
      ],
    },
    'er-content-04': {
      id: 'er-content-04',
      type: 'content',
      doc: 'examples: digit, letter',
      content: [
        { type: 'digit', value: 7, size: 'medium', align: 'center' },
        { type: 'letter', letter: 'Z', size: 'large', align: 'right' },
      ],
    },
    'er-content-05': {
      id: 'er-content-05',
      type: 'content',
      doc: 'examples: sprite-grid, sprite-sequence',
      content: [
        { type: 'sprite-grid', library: 'glyphs', spriteIds: ['glyph-01', 'glyph-02', 'glyph-03'] },
        {
          type: 'sprite-sequence',
          library: 'alien-signs',
          spriteIds: ['sign-01', 'sign-02'],
          direction: 'horizontal',
        },
      ],
    },
    'er-complete-01': {
      id: 'er-complete-01',
      type: 'complete-mission',
      doc: 'examples: complete-mission',
      content: [],
    },
  },
  updatedAt: 1704067200,
  ready: true,
};
