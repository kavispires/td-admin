import { useQueryParams } from 'hooks/useQueryParams';
import type { UseEscapeRoomResourceReturnType } from 'pages/EscapeRoom/useEscapeRoomResource';
import { AllCardsGrid } from './AllCardsGrid';
import { EscapeRoomCreateSet } from './EscapeRoomCreateSet';
import { MissionSetsTable } from './MissionSetsTable';

export function EscapeRoomContent(query: UseEscapeRoomResourceReturnType) {
  const { queryParams, is } = useQueryParams();

  return (
    <>
      {(is('display', 'sets') || !queryParams.get('display')) && <MissionSetsTable {...query} />}
      {is('display', 'cards') && <AllCardsGrid {...query} />}
      {is('display', 'create') && <EscapeRoomCreateSet {...query} />}
    </>
  );
}
