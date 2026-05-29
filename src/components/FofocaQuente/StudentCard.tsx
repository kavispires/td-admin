import { ManOutlined, QuestionOutlined, WomanOutlined } from '@ant-design/icons';
import { Card, Flex, Tag } from 'antd';
import { IdField } from 'components/Common/EditableFields';
import { ImageCard } from 'components/Images/ImageCard';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import type { TeenageStudent } from 'types';

export function StudentCard({ student }: { student: TeenageStudent }) {
  const { is } = useQueryParams();
  return (
    <Card
      cover={
        is('imageVariant', 'gb') ? (
          <SuspectImageCard cardId={student.imageId} cardWidth={220} className="suspect__image" />
        ) : (
          <ImageCard cardId={student.id} cardWidth={220} preview={false} />
        )
      }
      hoverable
      style={{ width: 230, maxWidth: 230 }}
    >
      <Card.Meta
        avatar={getGenderIcon(student)}
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
            <Flex vertical>
              <IdField value={student.id} />
              <IdField value={student.imageId.split('-')[2]} />
            </Flex>
          </Flex>
        }
        title={student.name.en}
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
  const colorMap: Record<string, { background: string; borderColor: string }> = {
    arts: { background: '#fff30a', borderColor: '#746f04' },
    outsiders: { background: '#532b23', borderColor: '#c4867a' },
    'jet-set': { background: '#f914e4', borderColor: '#f1b1eb' },
    jocks: { background: '#fa2e45', borderColor: '#ffd9dd' },
    leaders: { background: '#015aca', borderColor: '#7eb4f8' },
    nerds: { background: '#01efb7', borderColor: '#064939' },
    outcasts: { background: '#ff9743', borderColor: '#853d02' },
    'special-needs': { background: '#32c91e', borderColor: '#125908' },
    troublemakers: { background: '#7746c8', borderColor: '#cdb1fa' },
    misfits: { background: '#b5ab9f', borderColor: '#766d62' },
  };

  const colors = colorMap[socialGroupId];

  return (
    <Tag
      style={{
        textTransform: 'uppercase',
        width: '100%',
        background: colors?.background,
        color: `contrast-color(${colors?.background})`,
        borderColor: colors?.borderColor,
      }}
    >
      {socialGroupId}
    </Tag>
  );
};
