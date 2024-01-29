import { AppstoreOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Form, Segmented, Tooltip } from 'antd';
import { SegmentedValue } from 'antd/es/segmented';
import { useQueryParams } from 'hooks/useQueryParams';

export function ResourceDisplayMode() {
  const { queryParams, addParam } = useQueryParams();

  return (
    <div className="sider-content">
      <Form.Item label="Display">
        <Segmented
          block
          value={queryParams.display ?? 'json'}
          onChange={(mode: SegmentedValue) => addParam('display', mode)}
          options={[
            {
              label: (
                <Tooltip title="JSON">
                  <FileTextOutlined />
                </Tooltip>
              ),
              value: 'json',
            },
            {
              label: (
                <Tooltip title="Table">
                  <TableOutlined />
                </Tooltip>
              ),
              value: 'table',
            },
            {
              label: (
                <Tooltip title="Cards">
                  <AppstoreOutlined />
                </Tooltip>
              ),
              value: 'cards',
            },
          ]}
        />
      </Form.Item>
      <Divider />
    </div>
  );
}
