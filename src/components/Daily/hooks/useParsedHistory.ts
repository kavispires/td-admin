import { useMemo } from 'react';
import type { DailyHistory, ParsedDailyHistoryEntry } from '../utils/types';
import { getYesterday } from '../utils/utils';

export function useParsedHistory(
  key: keyof DailyHistory,
  data?: DailyHistory,
): [ParsedDailyHistoryEntry, DailyHistory[keyof DailyHistory]] {
  const history = useMemo(
    () =>
      data?.[key] ?? {
        latestDate: getYesterday(),
        latestNumber: 0,
        used: '[]',
        reset: 0,
      },
    [data, key],
  );

  const parsedHistory: ParsedDailyHistoryEntry = useMemo(() => {
    return {
      latestNumber: history?.latestNumber ?? 0,
      latestDate: history?.latestDate ?? getYesterday(),
      used: JSON.parse(history?.used ?? '[]'),
      reset: history?.reset ?? 0,
    };
  }, [history]);

  return [parsedHistory, history];
}
