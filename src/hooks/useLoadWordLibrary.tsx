import { isEmpty } from 'lodash';

import { useQuery } from '@tanstack/react-query';
import { useBaseUrl } from 'hooks/useBaseUrl';

export function useLoadWordLibrary(
  wordLength: number,
  language: Language,
  enabled = true,
  selected?: boolean,
) {
  const { getUrl } = useBaseUrl('resources');

  const resourceName = selected
    ? `words-${wordLength}-letters-selected-${language}`
    : `words-${wordLength}-letters-${language}`;
  const query = useQuery<string[], ResponseError>({
    queryKey: [resourceName],
    queryFn: async () => {
      const res = await fetch(getUrl(`${resourceName}.json`));
      return (await res.json()) as string[];
    },
    enabled: enabled && !!wordLength && !!language,
  });
  const hasResponseData = !isEmpty(query.data);

  return {
    ...query,
    data: query.data ?? [],
    hasResponseData,
  };
}
