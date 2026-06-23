import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useMemo } from 'react';
import type { CrimeSceneTileData, CrimesHediondosCardData } from 'types';
import { CrimeTableContent } from './CrimeTable';
import './CrimesHediondos.scss';
import { Alert } from 'antd';
import { SceneTable } from './SceneTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirestoreDataReturnType<CrimesHediondosCardData>;
  evidenceQuery: UseResourceFirestoreDataReturnType<CrimesHediondosCardData>;
  locationsQuery: UseResourceFirestoreDataReturnType<CrimesHediondosCardData>;
  victimsQuery: UseResourceFirestoreDataReturnType<CrimesHediondosCardData>;
  scenesQuery: UseResourceFirestoreDataReturnType<CrimeSceneTileData>;
};

export type CrimesHediondosInnerContentProps = {
  rows: CrimesHediondosCardData[];
  onUpdateCard: (card: CrimesHediondosCardData) => void;
};

export function CrimesHediondosContent({
  weaponsQuery,
  evidenceQuery,
  scenesQuery,
  locationsQuery,
  victimsQuery,
}: CrimesHediondosContentProps) {
  const { is, queryParams } = useQueryParams();

  const rows = useMemo(() => {
    return [
      ...Object.values(weaponsQuery.data),
      ...Object.values(evidenceQuery.data),
      ...Object.values(locationsQuery.data),
      ...Object.values(victimsQuery.data),
    ];
  }, [weaponsQuery.data, evidenceQuery.data, locationsQuery.data, victimsQuery.data]);

  const onUpdateCard = (card: CrimesHediondosCardData) => {
    if (card.type === 'weapon') {
      weaponsQuery.addEntryToUpdate(card.id, card);
    } else if (card.type === 'evidence') {
      evidenceQuery.addEntryToUpdate(card.id, card);
    } else {
      throw new Error('Invalid card type');
    }
  };

  return (
    <>
      {(is('display', 'cards') || !queryParams.has('display')) && (
        <CrimeTableContent
          evidence={Object.values(evidenceQuery.data)}
          locations={Object.values(locationsQuery.data)}
          onUpdateCard={onUpdateCard}
          rows={rows}
          scenes={scenesQuery.data}
          victims={Object.values(victimsQuery.data)}
          weapons={Object.values(weaponsQuery.data)}
        />
      )}

      {is('display', 'tags') && (
        <Alert
          closable
          showIcon
          title="Tags table is not implemented yet"
          type="info"
        />
      )}

      {is('display', 'scenes') && (
        <SceneTable
          objects={rows}
          sceneQuery={scenesQuery}
        />
      )}
    </>
  );
}
