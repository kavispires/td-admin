import { BarChartOutlined } from '@ant-design/icons';
import { Form, Avatar } from 'antd';
import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';

export function RelationshipsStats() {
  const {
    query: { stats },
  } = useImagesRelationshipsContext();

  return (
    <Form.Item
      label={
        <>
          <Avatar icon={<BarChartOutlined />} shape="square" size="small" style={{ marginRight: 6 }} />
          Stats
        </>
      }
    >
      <ul className="statistic__list">
        <li>Completion: {Math.floor((stats.total * 100) / (10 * 252))}%</li>
        <li>Total Relationships: {stats.total}</li>
        <li>Complete: {stats.complete}</li>
        <li>Overdone: {stats.overdone}</li>
        <li>Single Match: {stats.single}</li>
      </ul>
    </Form.Item>
  );
}
