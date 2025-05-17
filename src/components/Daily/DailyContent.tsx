import { useQueryParams } from 'hooks/useQueryParams';
import { DailyDataCheck } from './DailyDataCheck';
import { DailyDataPopulation } from './DailyDataPopulation';

export function DailyContent() {
  const { queryParams } = useQueryParams();

  if (queryParams.get('display') === 'archive') {
    return <div>{/* Population content goes here */}</div>;
  }

  if (queryParams.get('display') === 'check') {
    return <DailyDataCheck />;
  }

  return <DailyDataPopulation />;
}
