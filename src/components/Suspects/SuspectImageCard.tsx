import { ImageCard, type ImageCardProps } from 'components/Images/ImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import type { SuspectStyleVariant } from 'types';

type SuspectImageCardProps = {
  cardId: string;
  variant?: SuspectStyleVariant;
} & ImageCardProps;

export function SuspectImageCard({ cardId, variant, ...imageCardProps }: SuspectImageCardProps) {
  const { queryParams } = useQueryParams();
  const vr = variant ?? queryParams.get('variant') ?? 'gb';

  return <ImageCard cardId={getSuspectImageId(cardId, vr)} {...imageCardProps} />;
}

/**
 * Generates a suspect image ID based on the provided ID and optional variant.
 * If no variant is provided, returns the original ID.
 * Otherwise, transforms the ID format to include the variant.
 *
 * @param id - The original suspect ID, expected to have a format like "prefix-suffix"
 * @param variant - Optional variant code to insert into the ID (defaults to 'gb' if specified but empty)
 * @returns The modified suspect image ID with the variant included, or the original ID if no variant provided
 *
 * @example
 * Returns "us-gb-123" if variant is provided
 * getSuspectImageId("us-123", "gb");
 *
 * @example
 * Returns "us-123" if no variant is provided
 * getSuspectImageId("us-123");
 */
export const getSuspectImageId = (() => {
  const cache = new Map<string, string>();

  return (id: string, variant?: SuspectStyleVariant): string => {
    if (!variant) {
      return id;
    }

    const key = `${id}|${variant ?? ''}`;

    if (cache.has(key)) return cache.get(key) as string;

    const splitId = id.split('-');
    const result = `${splitId[0]}-${variant}-${splitId[splitId.length - 1]}`;
    cache.set(key, result);
    return result;
  };
})();
