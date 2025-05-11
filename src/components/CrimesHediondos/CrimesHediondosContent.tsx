import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo } from 'react';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { CrimeTableContent } from './CrimeTable';
import './CrimesHediondos.scss';
import { Alert } from 'antd';
import { SceneTable } from './SceneTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  evidenceQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  locationsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  victimsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  scenesQuery: UseResourceFirebaseDataReturnType<CrimeSceneTile>;
};

export type CrimesHediondosInnerContentProps = {
  rows: CrimesHediondosCard[];
  onUpdateCard: (card: CrimesHediondosCard) => void;
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

  const onUpdateCard = (card: CrimesHediondosCard) => {
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
          rows={rows}
          onUpdateCard={onUpdateCard}
          weapons={Object.values(weaponsQuery.data)}
          evidence={Object.values(evidenceQuery.data)}
          locations={Object.values(locationsQuery.data)}
          victims={Object.values(victimsQuery.data)}
          scenes={scenesQuery.data}
        />
      )}

      {is('display', 'tags') && (
        <Alert type="info" message="Tags table is not implemented yet" showIcon closable />
      )}

      {is('display', 'scenes') && <SceneTable sceneQuery={scenesQuery} objects={rows} />}
    </>
  );
}
