import { type QueryKey, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type DocumentData, doc, updateDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';

export function updateQueryFunction<TData = PlainObject>(path: string, docId: string, data: TData) {
  console.log(`%cUpdating ${path}/${docId} from firebase`, 'color: #f00');
  const docRef = doc(firestore, `${path}/${docId}`);
  return updateDoc(docRef, data as DocumentData);
}

export function useUpdateFirestoreDoc<TData>(
  path: string,
  docId: string,
  options: UseMutationOptions<any, Error, TData, QueryKey> = {},
) {
  return useMutation<any, Error, TData, QueryKey>({
    mutationFn: async (data: TData) => updateQueryFunction<TData>(path, docId, data),
    ...options,
  });
}
