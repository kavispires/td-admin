import { ColumnHeightOutlined, ColumnWidthOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
import { useCardWidth } from 'hooks/useCardWidth';
import type { FeatureFilmRole } from './FeatureFilmViewV2';

type ActorRoleProps = {
  role: FeatureFilmRole;
  language: Language;
};

export function ActorRole({ role, language }: ActorRoleProps) {
  const [cardWidth] = useCardWidth(8);

  return (
    <div key={role.id}>
      <Typography.Title level={3}>{role.title[language]}</Typography.Title>
      <div className="suspect">
        <SuspectImageCard
          cardId={role.actor.id}
          cardWidth={cardWidth}
          className="suspect__image"
          variant="gb"
        />

        <div className="suspect__name">
          <div>
            <Tag>{role.actor.id}</Tag>
          </div>
          <div>
            🇧🇷 {role.actor.name.pt}, {role.persona.pt}
          </div>
          <div>
            🇺🇸 {role.actor.name.en}, {role.persona.en}
          </div>
          <div className="suspect__info">
            <div>
              <div>
                {role.actor.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {role.actor.age}
              </div>
              <div>
                <em>{role.actor.race}</em>
              </div>
            </div>
            <div>
              <ColumnWidthOutlined />
              <br />
              {role.actor.build}
            </div>
            <div>
              <ColumnHeightOutlined />
              <br />
              {role.actor.height}
            </div>
          </div>
        </div>
      </div>

      <br />
      <strong>Traits:</strong>
      <ul>
        {role.traits.map((trait) => (
          <li key={trait}>{trait}</li>
        ))}
      </ul>
    </div>
  );
}
