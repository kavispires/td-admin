import { Divider, Form, Select } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { SPRITE_LIBRARY } from 'utils/constants';

export function SpriteFilters() {
  const qp = useQueryParams({});

  return (
    <div className="sider-content">
      <Form.Item label="Library">
        <Select
          style={{ minWidth: '150px' }}
          onChange={(value) => qp.addParam('sprite', value)}
          value={qp.queryParams.sprite}
        >
          {Object.values(SPRITE_LIBRARY).map((entry) => (
            <Select.Option key={entry.key} value={entry.key}>
              {entry.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Divider />
    </div>
  );
}
