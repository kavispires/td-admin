import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { CrimeTableContent } from './CrimeTable';
import './CrimesHediondos.scss';
import { SceneTable } from './SceneTable';
import { TagsTable } from './TagsTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  evidenceQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  locationsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  victimsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  scenesQuery: UseResourceFirebaseDataReturnType<CrimeSceneTile>;
};

export type CrimesHediondosInnerContentProps = {
  rows: CrimesHediondosCard[];
  allTags: { label: string; value: string; count: number }[];
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

  const allTags = useMemo(() => {
    const tagsDict: NumberDictionary = {};

    rows.forEach((row) => {
      row.tags?.forEach((tag) => {
        tagsDict[tag] = (tagsDict[tag] ?? 0) + 1;
      });
    });

    return orderBy(
      Object.entries(tagsDict).map(([tag, count]) => ({ value: tag, label: tag, count })),
      ['value'],
      ['asc'],
    );
  }, [rows]);

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
          allTags={allTags}
          onUpdateCard={onUpdateCard}
          weapons={Object.values(weaponsQuery.data)}
          evidence={Object.values(evidenceQuery.data)}
          locations={Object.values(locationsQuery.data)}
          victims={Object.values(victimsQuery.data)}
        />
      )}

      {is('display', 'tags') && (
        <TagsTable
          rows={rows}
          weapons={weaponsQuery.data}
          evidence={evidenceQuery.data}
          onUpdateCard={onUpdateCard}
          allTags={allTags}
        />
      )}

      {is('display', 'scenes') && <SceneTable sceneQuery={scenesQuery} allTags={allTags} objects={rows} />}
    </>
  );
}
