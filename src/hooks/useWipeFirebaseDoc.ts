import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { wait } from 'utils';

/**
 * Hook that provides a mutation function to set a document in Firestore
 * @param collection - The Firestore collection name
 * @param id - The document ID
 * @param options - Options for the setDoc operation (default: { merge: true })
 * @param invalidateQueries - Array of query keys to invalidate after successful mutation
 */
export function useWipeFirebaseDoc({
  path,
  docId,
  queryKey,
  onSuccess,
}: {
  path: string;
  docId: string;
  queryKey: string[];
  onSuccess?: () => void;
}) {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const docRef = doc(firestore, path, docId);
      if (!path || (!path.includes('tdr') && !path.includes('testimonies'))) {
        throw new Error('This hook should only be used for wiping documents in the tdr/testimonies path');
      }
      if (!docId) {
        throw new Error('Document ID is required');
      }
      console.log(`Wiping document at ${path}/${docId}`);
      await wait(1000);

      return setDoc(docRef, {});
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: queryKey });
      notification.success({
        message: `Document ${path}/${docId} wiped successfully`,
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error wiping document:', error);
      notification.error({
        message: `Failed to wipe document ${path}/${docId}`,
        description: error.message,
      });
    },
  });
}
