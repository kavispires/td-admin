import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { CrimesHediondosCard } from 'types';
import { CrimeTable } from './CrimeTable';

export type CrimesHediondosContentProps = {
  weaponsQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
  evidenceQuery: UseResourceFirebaseDataReturnType<CrimesHediondosCard>;
};

export function CrimesHediondosContent({ weaponsQuery, evidenceQuery }: CrimesHediondosContentProps) {
  const { is, queryParams } = useQueryParams();

  return (
    <>
      {(is('display', 'listing') || !queryParams.has('display')) && (
        <CrimeTable weaponsQuery={weaponsQuery} evidenceQuery={evidenceQuery} />
      )}

      {is('display', 'classifier') && (
        <div>
          <div>?</div>
        </div>
      )}

      {is('display', 'scenes') && (
        <div>
          <div>?</div>
        </div>
      )}
    </>
  );
}
