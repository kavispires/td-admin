import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { sample, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { ImageCardDescriptor } from 'types';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, ParsedDailyHistoryEntry } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';
import { addWarning } from '../warnings';

export type Point = { x: number; y: number };

export type Piece = {
  id: string;
  correctPos: number; // what grid index it belongs to
  shape: Point[];
};

export type PieceState = Point & {
  isLocked: boolean;
};

export type DailyVitraisEntry = {
  id: string;
  number: number;
  type: 'vitrais';
  title: string;
  cardId: string;
  pieces: number[]; // shuffled array of pieces ids. Each id is composed of a number that represents the piece index (0-N) of the puzzle in the correct order
};

export const useDailyVitraisGames = (enabled: boolean, batchSize: number, dailyHistory: DailyHistory) => {
  const [vitraisHistory] = useParsedHistory(DAILY_GAMES_KEYS.VITRAIS, dailyHistory);

  const dailyVitraisSetQuery = useTDResource<ImageCardDescriptor>('image-cards', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || dailyVitraisSetQuery.isLoading || !vitraisHistory) {
      return {};
    }

    return buildDailyPuzzleGames(batchSize, vitraisHistory, dailyVitraisSetQuery.data);
  }, [enabled, vitraisHistory, batchSize, dailyVitraisSetQuery.dataUpdatedAt]);

  return {
    entries,
    isLoading: dailyVitraisSetQuery.isLoading,
  };
};

export const buildDailyPuzzleGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  puzzleSets: Dictionary<ImageCardDescriptor>,
) => {
  console.count('Creating Vitrais...');

  // Filter out any incomplete sets, used sets, and cards without Portuguese title
  const eligibleSets = shuffle(
    Object.values(puzzleSets).filter((setEntry) => !history.used.includes(setEntry.id) && setEntry.title?.pt),
  );

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyVitraisEntry> = {};
  Array.from({ length: batchSize }).forEach((_, i) => {
    const id = getNextDay(lastDate);

    lastDate = id;

    const selectedSet = eligibleSets[i];

    if (!selectedSet) {
      addWarning(
        'vitrais',
        `Not enough eligible Daily Vitrais sets to create a new puzzle for date ${id}. Please add more sets or clear used history.`,
      );
      return;
    }

    let result: number[];
    try {
      result = shufflePieces(getDayOfTheWeek(id));
    } catch (e) {
      addWarning(
        'vitrais',
        `Error generating Daily Vitrais puzzle for date ${id} with set ${selectedSet.title.pt}: ${e}`,
      );
      return;
    }

    entries[id] = {
      id,
      number: history.latestNumber + i + 1,
      type: 'vitrais',
      title: selectedSet.title.pt,
      cardId: selectedSet.id,
      pieces: result,
    };
  });

  return entries;
};

/**
 * Shuffles puzzle pieces ensuring no piece is in its correct position (derangement)
 * @param isWeekend - Whether the puzzle is for a weekend (more pieces)
 * @returns An array of shuffled piece indices where pieces[i] !== i for all i
 */
function shufflePieces(dayOfWeek: number): number[] {
  const piecesOptions: Record<number, number[]> = {
    0: [30, 33, 36], // Sunday
    1: [9, 12], // Monday
    2: [12, 18], // Tuesday
    3: [18, 21, 24], // Wednesday
    4: [21, 24, 27], // Thursday
    5: [24, 27, 30], // Friday
    6: [27, 30, 33], // Saturday
  };

  const piecesCount = sample(piecesOptions[dayOfWeek]) ?? 12;
  const pieces = Array.from({ length: piecesCount }, (_, i) => i);
  let tries = 0;
  let valid = false;
  let shuffled = [...pieces];

  while (tries < ATTEMPTS_THRESHOLD && !valid) {
    shuffled = shuffle([...pieces]);
    // Fix any pieces that are in their correct position by swapping with the next element
    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i] === i) {
        const nextIndex = (i + 1) % shuffled.length;
        [shuffled[i], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[i]];
      }
    }
    // Check if any piece is in its correct position
    valid = shuffled.every((pieceId, index) => pieceId !== index);
    tries++;
  }

  if (!valid) {
    throw new Error(
      `Failed to generate valid derangement for ${piecesCount} pieces after ${ATTEMPTS_THRESHOLD} attempts`,
    );
  }

  if (pieces.length !== piecesCount) {
    throw new Error(`Generated pieces count mismatch: expected ${piecesCount}, got ${pieces.length}`);
  }

  return shuffled;
}
