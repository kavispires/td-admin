import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { fetchGenerativeContent } from 'services/aiGenerator';

/**
 * Custom hook to fetch generative content from AI using React Query mutation
 * @param options - Additional React Query mutation options
 * @returns Mutation result with data, isLoading, error, mutate, etc.
 */
export function useGenerativeContent(
  options?: Omit<UseMutationOptions<string, Error, string, unknown>, 'mutationFn'>,
) {
  return useMutation<string, Error, string>({
    mutationFn: (prompt: string) => {
      try {
        return fetchGenerativeContent(prompt);
      } catch (error) {
        console.error('Error fetching generative content:', error);
        throw error instanceof Error ? error : new Error('Unknown error');
      }
    },
    ...options,
  });
}
