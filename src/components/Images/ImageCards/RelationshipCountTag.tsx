import { TagsFilled } from '@ant-design/icons';
import { Tag } from 'antd';

type RelationshipCountTagProps = {
  card: string[];
};
export function RelationshipCountTag({ card }: RelationshipCountTagProps) {
  const color = card.length > 10 ? 'red' : card.length > 5 ? 'blue' : card.length > 0 ? 'green' : undefined;
  return (
    <div>
      <Tag color={color} icon={<TagsFilled />}>
        {' '}
        {card.length}
      </Tag>
    </div>
  );
}
