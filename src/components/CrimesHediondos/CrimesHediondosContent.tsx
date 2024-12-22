import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { CrimeTable } from './CrimeTable';
import { useMemo } from 'react';
import { orderBy } from 'lodash';
import './CrimesHediondos.scss';
import { TagsTable } from './TagsTable';
import { SceneTable } from './SceneTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  evidenceQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
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
}: CrimesHediondosContentProps) {
  const { is, queryParams } = useQueryParams();

  const rows = useMemo(() => {
    return [...Object.values(weaponsQuery.data), ...Object.values(evidenceQuery.data)];
  }, [weaponsQuery.data, evidenceQuery.data]);

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
        <CrimeTable rows={rows} allTags={allTags} onUpdateCard={onUpdateCard} />
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
