import { useQueryParams } from 'hooks/useQueryParams';
import { DailyDataArchive } from './DailyDataArchive';
import { DailyDataCheck } from './DailyDataCheck';
import { DailyDataPopulation } from './DailyDataPopulation';

export function DailyContent() {
  const { queryParams } = useQueryParams();

  if (queryParams.get('display') === 'archive') {
    return <DailyDataArchive />;
  }

  if (queryParams.get('display') === 'check') {
    return <DailyDataCheck />;
  }

  return <DailyDataPopulation />;
}
