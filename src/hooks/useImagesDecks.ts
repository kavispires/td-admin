import { useQuery } from '@tanstack/react-query';

import { useBaseUrl } from './useBaseUrl';

export function useImagesDecks() {
  const { getUrl } = useBaseUrl('resources');
  const query = useQuery<NumberDictionary, ResponseError>({
    queryKey: ['images-decks'],
    queryFn: async () => {
      const res = await fetch(getUrl('images-decks.json'));
      return (await res.json()) as NumberDictionary;
    },
  });

  return {
    ...query,
    data: query.data ?? {},
  };
}
