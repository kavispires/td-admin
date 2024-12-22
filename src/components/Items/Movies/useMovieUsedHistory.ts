import { useDailyHistoryQuery } from 'components/Daily/hooks/useDailyHistoryQuery';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { LANGUAGE_PREFIX } from 'components/Daily/utils/constants';
import { keyBy, mapValues } from 'lodash';
import { useMemo } from 'react';

export function useMovieUsedHistory() {
  const source = LANGUAGE_PREFIX.DAILY['pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled: true });
  const [filmacoHistory] = useParsedHistory('filmaco', historyQuery.data);

  const used: BooleanDictionary = useMemo(
    () => mapValues(keyBy(filmacoHistory?.used ?? []), () => true),
    [filmacoHistory],
  );

  return used;
}
