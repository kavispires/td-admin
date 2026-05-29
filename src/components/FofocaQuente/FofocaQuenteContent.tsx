import type { TeenageStudent } from 'types';
import './FofocaQuente.scss';
import { useQueryParams } from 'hooks/useQueryParams';
import type { useTDResource } from 'hooks/useTDResource';
import { StudentListing } from './StudentListing';
import { StudentsStats } from './StudentsStats';

export type FofocaQuenteContentProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function FofocaQuenteContent(props: FofocaQuenteContentProps) {
  const { queryParams, is } = useQueryParams();

  return (
    <>
      {(is('display', 'listing') || !queryParams.get('display')) && <StudentListing {...props} />}
      {is('display', 'stats') && <StudentsStats {...props} />}
    </>
  );
}
