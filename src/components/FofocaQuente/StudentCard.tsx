import { ManOutlined, QuestionOutlined, WomanOutlined } from '@ant-design/icons';
import { Card, Flex, Tag } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { ImageCard } from 'components/Images/ImageCard';
import { TeenageStudent } from 'types';

export function StudentCard({ student }: { student: TeenageStudent }) {
  return (
    <Card hoverable style-={{ width: 240, maxWidth: 240 }} cover={<ImageCard id={student.id} width={240} />}>
      <Card.Meta
        avatar={getGenderIcon(student)}
        title={student.name.en}
        description={
          <Flex vertical>
            <Flex>{student.title.en}</Flex>
            <Flex>
              <Tag style={{ textTransform: 'uppercase' }}>{student.socialGroup}</Tag>
            </Flex>
            <Flex>
              {student.age} | {student.ethnicity}
            </Flex>
            <Flex gap={8}>
              <Tag style={{ textTransform: 'uppercase' }}>{student.build[0]}</Tag>
              <Tag style={{ textTransform: 'uppercase' }}>{student.height[0]}</Tag>
            </Flex>
            <Flex gap={8}>
              {student.id} <CopyToClipboardButton content={student.id} />
            </Flex>
          </Flex>
        }
      />
      <Card.Meta />
    </Card>
  );
}

const getGenderIcon = (student: TeenageStudent) => {
  switch (student.gender) {
    case 'male':
      return <ManOutlined />;
    case 'female':
      return <WomanOutlined />;
    default:
      return <QuestionOutlined />;
  }
};
