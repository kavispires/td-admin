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

export const DEMO_CARDS_DICT: Dictionary<EscapeRoomCardType> = {};

export const DEMO_HAND = Object.keys(DEMO_CARDS_DICT);

export const DEMO_BRIEFING: MissionBriefing[] = [
  {
    id: 'er-mb-01-A',
    number: 1,
    missionId: 'er-ms-47a',
    name: 'Um começo simples',
    level: 1,
    cardsIds: ['er-wd-9b2', 'er-wd-7e0', 'er-wd-e41', 'er-wd-7dc', 'er-wd-986', 'er-wd-83e'],
    solution: {
      cardsIds: ['er-wd-9b2'],
      type: 'all',
    },
  },
];
