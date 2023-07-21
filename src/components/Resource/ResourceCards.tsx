import { Card } from 'antd';

type ResourceCardsProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceCards({ response, resourceName }: ResourceCardsProps) {
  const list: any[] = Object.values(response);

  const getCard = () => {
    switch (resourceName) {
      case 'adjectives':
      case 'categories':
      case 'challenges':
        return TextCard;
      default:
        return TextCard;
    }
  };

  const CardC = getCard();

  return (
    <div className="page-content">
      <ul className="resource-cards">
        {list.map((entry) => {
          return (
            <li key={entry.id} className="resource-cards__entry">
              <CardC entry={entry} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type TextCardProps = {
  entry: {
    id: string;
    text: string;
  };
};

function TextCard({ entry }: TextCardProps): JSX.Element {
  return (
    <Card title={entry.id} className="resource-cards__card" size="small">
      {entry.text}
    </Card>
  );
}
