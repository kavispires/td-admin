import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import type { SuspectCardData, SuspectExtendedInfoData } from '@types';
import { SuspectsListing } from './SuspectsListing';
import { SuspectsStats } from './SuspectsStats';

export function SuspectsContent(props: {
  suspectsQuery: UseResourceFirestoreDataReturnType<SuspectCardData>;
  suspectsExtendedInfoQuery: UseResourceFirestoreDataReturnType<SuspectExtendedInfoData>;
}) {
  const { queryParams, is } = useQueryParams();

  return (
    <>
      {(is('display', 'listing') || !queryParams.get('display')) && <SuspectsListing {...props} />}
      {is('display', 'stats') && <SuspectsStats {...props} />}
    </>
  );
}
