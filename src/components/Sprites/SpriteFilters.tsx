import { Form } from 'antd';
import { FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { SPRITE_LIBRARY } from 'utils/constants';

const SPRITES = Object.values(SPRITE_LIBRARY).map((entry) => ({ value: entry.key, label: entry.name }));

export function SpriteFilters() {
  const { queryParams, addParam } = useQueryParams();

  return (
    <SiderContent>
      <Form layout="vertical">
        <FilterSelect
          label="Library"
          onChange={(value) => addParam('sprite', value)}
          options={SPRITES}
          value={queryParams.get('sprite') ?? ''}
        />
      </Form>
    </SiderContent>
  );
}
