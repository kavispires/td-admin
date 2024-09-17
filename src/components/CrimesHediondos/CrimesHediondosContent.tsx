import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { CrimesHediondosCard } from 'types';
import { CrimeTable } from './CrimeTable';
import { useMemo } from 'react';
import { orderBy } from 'lodash';
import './CrimesHediondos.scss';
import { TagTable } from './TagTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  evidenceQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
};

export type CrimesHediondosInnerContentProps = {
  rows: CrimesHediondosCard[];
  allTags: { label: string; value: string; count: number }[];
  addWeaponToUpdate: UseResourceFirebaseDataReturnType<CrimesHediondosCard>['addEntryToUpdate'];
  addEvidenceToUpdate: UseResourceFirebaseDataReturnType<CrimesHediondosCard>['addEntryToUpdate'];
};

export function CrimesHediondosContent({ weaponsQuery, evidenceQuery }: CrimesHediondosContentProps) {
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
      ['asc']
    );
  }, [rows]);

  return (
    <>
      {(is('display', 'cards') || !queryParams.has('display')) && (
        <CrimeTable
          rows={rows}
          allTags={allTags}
          addWeaponToUpdate={weaponsQuery.addEntryToUpdate}
          addEvidenceToUpdate={evidenceQuery.addEntryToUpdate}
        />
      )}

      {is('display', 'tags') && (
        <>
          <TagTable />
        </>
      )}

      {is('display', 'scenes') && (
        <div>
          <div>?</div>
        </div>
      )}
    </>
  );
}
