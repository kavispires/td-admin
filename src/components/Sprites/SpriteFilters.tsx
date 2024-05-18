import { FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { SPRITE_LIBRARY } from 'utils/constants';

const SPRITES = Object.values(SPRITE_LIBRARY).map((entry) => ({ value: entry.key, label: entry.name }));

export function SpriteFilters() {
  const { queryParams, addParam } = useQueryParams();

  return (
    <SiderContent>
      <FilterSelect
        label="Library"
        value={queryParams.get('sprite') ?? ''}
        onChange={(value) => addParam('sprite', value)}
        options={SPRITES}
      />
    </SiderContent>
  );
}
