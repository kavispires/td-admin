import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Drawer, Flex, Radio, Switch, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { SuspectCard } from 'types';
import { getSuspectImageId } from './utils';

type SuspectDrawerProps = Pick<UseResourceFirestoreDataReturnType<SuspectCard>, 'data' | 'addEntryToUpdate'>;

export function SuspectDrawer({ data, addEntryToUpdate }: SuspectDrawerProps) {
  const { removeParam, queryParams } = useQueryParams();
  const suspectId = queryParams.get('suspectId');
  const version = queryParams.get('version') ?? 'gb';
  const suspect = data[suspectId ?? ''];

  if (!suspect) return null;

  return (
    <Drawer
      title={suspect.name.pt}
      placement="right"
      onClose={() => removeParam('suspectId')}
      open={!!suspect}
      width={400}
    >
      <div className="suspect__drawer">
        <div className="grid grid-2">
          <ImageCard id={getSuspectImageId(suspect.id, version)} width={100} />
          <Flex vertical gap={4}>
            <div>🇧🇷 {suspect.name.pt}</div>
            <div>🇺🇸 {suspect.name.en}</div>
            <div>
              <strong>{suspect.age}</strong>
            </div>
            <div>
              {suspect.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {suspect.gender}
            </div>
            <div>
              <em>{suspect.ethnicity}</em>
            </div>
          </Flex>
        </div>

        <div className="grid grid-2">
          <Flex vertical>
            <Typography.Text strong>Build</Typography.Text>
            <Radio.Group
              size="small"
              value={suspect.build}
              onChange={(e) => {
                addEntryToUpdate(suspect.id, { ...suspect, build: e.target.value });
              }}
              options={BUILDS}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            />
          </Flex>
          <Flex vertical>
            <Typography.Text strong>Height</Typography.Text>
            <Radio.Group
              size="small"
              value={suspect.height}
              onChange={(e) => {
                addEntryToUpdate(suspect.id, { ...suspect, height: e.target.value });
              }}
              options={HEIGHTS}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            />
          </Flex>
        </div>
        <SuspectFeatures suspect={suspect} addEntryToUpdate={addEntryToUpdate} />
      </div>
    </Drawer>
  );
}

type SuspectFeaturesProps = {
  suspect: SuspectCard;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<SuspectCard>['addEntryToUpdate'];
};

function SuspectFeatures({ suspect, addEntryToUpdate }: SuspectFeaturesProps) {
  const features = suspect.features ?? [];

  const onUpdateFeature = (featureId: string) => {
    const updatedFeatures = features.includes(featureId)
      ? features.filter((id) => id !== featureId)
      : [...features, featureId];

    addEntryToUpdate(suspect.id, { ...suspect, features: updatedFeatures });
  };
  return (
    <div className="grid grid-2">
      {FEATURES_BY_GROUP.map((group) => (
        <div key={group.title} className="my-4">
          <Typography.Text strong>{group.title}</Typography.Text>
          {group.features.map((feature) => (
            <Flex key={feature.id} className="my-2" gap={4}>
              <Switch
                size="small"
                checked={features.includes(feature.id)}
                onChange={() => onUpdateFeature(feature.id)}
              />{' '}
              {feature.label}
            </Flex>
          ))}
        </div>
      ))}
    </div>
  );
}

const BUILDS = ['thin', 'average', 'muscular', 'large'];
const HEIGHTS = ['short', 'medium', 'tall'];

export const FEATURES_BY_GROUP = [
  {
    title: 'Hair Length',
    features: [
      { id: 'shortHair', label: 'Short Hair' },
      { id: 'longHair', label: 'Long Hair' },
      { id: 'mediumHair', label: 'Medium Hair' },
      { id: 'bald', label: 'Bald' },
    ],
  },
  {
    title: 'Hair Color',
    features: [
      { id: 'blackHair', label: 'Black Hair' },
      { id: 'brownHair', label: 'Brown Hair' },
      { id: 'blondeHair', label: 'Blonde Hair' },
      { id: 'redHair', label: 'Red Hair' },
      { id: 'greyHair', label: 'Grey Hair' },
      { id: 'coloredHair', label: 'Colored Hair' },
    ],
  },
  {
    title: 'Face',
    features: [
      { id: 'beard', label: 'Beard' },
      { id: 'mustache', label: 'Mustache' },
      { id: 'goatee', label: 'Goatee' },
      { id: 'lipstick', label: 'Lipstick' },
    ],
  },
  {
    title: 'Accessories',
    features: [
      { id: 'glasses', label: 'Glasses' },
      { id: 'piercings', label: 'Piercings' },
      { id: 'earrings', label: 'Earrings' },
      { id: 'necklace', label: 'Necklace' },
      { id: 'hat', label: 'Hat' },
      { id: 'scarf', label: 'Scarf' },
      { id: 'hoodie', label: 'Hoodie' },
      { id: 'tie', label: 'Tie' },
      { id: 'headscarf', label: 'Headscarf/Bandana' },
    ],
  },
];
