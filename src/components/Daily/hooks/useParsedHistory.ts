import { useMemo } from 'react';
import { DailyHistory, ParsedDailyHistoryEntry } from '../utils/types';
import { getYesterday } from '../utils/utils';

export function useParsedHistory(
  key: keyof DailyHistory,
  data?: DailyHistory
): [ParsedDailyHistoryEntry, DailyHistory[keyof DailyHistory]] {
  const history = useMemo(
    () =>
      data?.[key] ?? {
        latestDate: getYesterday(),
        latestNumber: 0,
        used: '[]',
      },
    [data, key]
  );

  const parsedHistory: ParsedDailyHistoryEntry = useMemo(() => {
    return {
      latestNumber: history?.latestNumber ?? 0,
      latestDate: history?.latestDate ?? getYesterday(),
      used: JSON.parse(history?.used ?? '[]'),
    };
  }, [history]);

  return [parsedHistory, history];
}
