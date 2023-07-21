import { Divider, Form, Segmented } from 'antd';
import { SegmentedValue } from 'antd/es/segmented';
import { useQueryParams } from 'hooks/useQueryParams';

export function ResourceDisplayMode() {
  const { queryParams, addParam } = useQueryParams();

  return (
    <div className="sider-content">
      <Form.Item label="Display">
        <Segmented
          value={queryParams.display ?? 'json'}
          onChange={(mode: SegmentedValue) => addParam('display', mode)}
          options={[
            {
              label: 'JSON',
              value: 'json',
            },
            {
              label: 'Table',
              value: 'table',
            },
            {
              label: 'Cards',
              value: 'card',
            },
          ]}
        />
      </Form.Item>
      <Divider />
    </div>
  );
}
