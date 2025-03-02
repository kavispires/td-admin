import { ManOutlined, QuestionOutlined, WomanOutlined } from '@ant-design/icons';
import { Card, Flex, Tag } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { ImageCard } from 'components/Images/ImageCard';
import type { TeenageStudent } from 'types';

export function StudentCard({ student }: { student: TeenageStudent }) {
  return (
    <Card
      hoverable
      style-={{ width: 230, maxWidth: 230 }}
      cover={<ImageCard id={student.id} width={230} preview={false} />}
    >
      <Card.Meta
        avatar={getGenderIcon(student)}
        title={student.name.en}
        description={
          <Flex vertical>
            <Flex>{student.title.en}</Flex>
            <Flex>{getSocialGroup(student.socialGroupId)}</Flex>
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

const getSocialGroup = (socialGroupId: TeenageStudent['socialGroupId']) => {
  switch (socialGroupId) {
    case 'arts':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#fff30a',
            color: '#746f04',
            borderColor: '#746f04',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'immigrants':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#532b23',
            color: '#c4867a',
            borderColor: '#c4867a',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'jet-set':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#f914e4',
            color: '#f1b1eb',
            borderColor: '#f1b1eb',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'jocks':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#fa2e45',
            color: '#ffd9dd',
            borderColor: '#ffd9dd',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'leaders':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#015aca',
            color: '#7eb4f8',
            borderColor: '#7eb4f8',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'nerds':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#01efb7',
            color: '#064939',
            borderColor: '#064939',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'outcasts':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#ff9743',
            color: '#853d02',
            borderColor: '#853d02',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'special-needs':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#32c91e',
            color: '#125908',
            borderColor: '#125908',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    case 'troublemakers':
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#7746c8',
            color: '#cdb1fa',
            borderColor: '#cdb1fa',
          }}
        >
          {socialGroupId}
        </Tag>
      );
    default:
      return (
        <Tag
          style={{
            textTransform: 'uppercase',
            width: '100%',
            background: '#fff30a',
            color: '#746f04',
            borderColor: '#746f04',
          }}
        >
          {socialGroupId}
        </Tag>
      );
  }
};
