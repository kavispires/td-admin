import { FilterSegments } from 'components/Common';
import { useQueryParams } from 'hooks/useQueryParams';

const options = [
  { value: 'gb', title: 'Ghibli', icon: 'GB' },
  { value: 'rl', title: 'Realistic', icon: 'RL' },
  { value: 'px', title: 'Pixar', icon: 'PX' },
  { value: 'fx', title: 'Fox', icon: 'FX' },
];

export function SuspectsStyleVariantSelector() {
  const { addParam, queryParams } = useQueryParams();
  const variant = queryParams.get('variant') || 'gb';

  return (
    <FilterSegments
      label="Style Variant"
      value={variant}
      onChange={(value) => addParam('variant', value)}
      options={options}
    />
  );
}
