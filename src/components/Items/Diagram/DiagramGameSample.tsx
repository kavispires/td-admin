import { Collapse, Rate, Space, Typography } from 'antd';
import { DailyTeoriaDeConjuntosEntry } from 'components/Daily/utils/types';
import { Thing } from './Thing';

type DiagramGameSampleProps = {
  game: DailyTeoriaDeConjuntosEntry;
};

export function DiagramGameSample({ game }: DiagramGameSampleProps) {
  return (
    <Space direction="vertical" align="center">
      <Typography.Title level={4}>Game Sample</Typography.Title>
      <Typography.Title level={5}>"{game.title}"</Typography.Title>
      <Rate value={game.level} count={game.level} disabled />
      <Typography.Paragraph style={{ maxWidth: '500px' }}>
        O círculo amarelo tem uma regra gramatical secreta e o circulo vermelho tem outra regra gramatical
        secreta. O quadrado do meio representa a interseção entre a regra amarela e a regra vermelha.
      </Typography.Paragraph>

      <Space>
        <div className="diagram-simulator__rule-1">
          <Thing itemId={game.rule1.thing.id} name={game.rule1.thing.name} />
        </div>
        <div className="diagram-simulator__rule-intersection">
          <Thing itemId={game.intersectingThing.id} name={game.intersectingThing.name} />
        </div>
        <div className="diagram-simulator__rule-2">
          <Thing itemId={game.rule2.thing.id} name={game.rule2.thing.name} />
        </div>
      </Space>
      <Typography.Text>Coloque os objetos nos círculos corretos:</Typography.Text>
      <Space className="space--center">
        {game.things.map((thing) => (
          <Thing key={thing.id} itemId={thing.id} name={thing.name} />
        ))}
      </Space>

      <Collapse
        items={[
          {
            key: '1',
            label: 'Resposta',
            children: (
              <Space direction="vertical">
                <Typography.Text strong>Regra Amarela</Typography.Text>
                <ul>
                  <li>
                    <Typography.Text>{game.rule1.text}</Typography.Text>
                  </li>
                </ul>

                <Typography.Text strong>Regra Vermelha</Typography.Text>
                <ul>
                  <li>
                    <Typography.Text>{game.rule2.text}</Typography.Text>
                  </li>
                </ul>
              </Space>
            ),
          },
        ]}
      />

      <div style={{ height: '200px' }}></div>
    </Space>
  );
}
