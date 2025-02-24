import { doc, getDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';

import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { getCurrentDateTime } from 'utils';

export function getDocQueryFunction<TQueryFnData>(path: string, docId: string) {
  return async () => {
    console.log(`%cQuerying ${path}/${docId} from firebase: ${getCurrentDateTime()}`, 'color: #f0f');
    const docRef = doc(firestore, `${path}/${docId}`);
    const querySnapshot = await getDoc(docRef);
    return (querySnapshot.data() ?? {}) as TQueryFnData;
  };
}

export function useGetFirebaseDoc<TQueryFnData, TData = TQueryFnData>(
  path: string,
  docId: string,
  options?: Omit<UseQueryOptions<any, Error, TData, QueryKey>, 'queryKey'>,
) {
  return useQuery<TQueryFnData, Error, TData, QueryKey>({
    queryKey: ['firebase', path, docId],
    queryFn: getDocQueryFunction<TQueryFnData>(path, docId),
    ...options,
  });
}
