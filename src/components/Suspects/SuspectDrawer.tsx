import { Drawer, Flex, Select, Switch, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { SuspectCard } from 'types';
import { getSuspectImageId } from './utils';

type SuspectDrawerProps = Pick<UseResourceFirebaseDataReturnType<SuspectCard>, 'data' | 'addEntryToUpdate'>;

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
        <div className="suspect__drawer__image">
          <ImageCard id={getSuspectImageId(suspect.id, version)} width={100} />
        </div>

        <div className="suspect__drawer__info">
          <Typography.Text strong>Build:</Typography.Text>
          <Select
            size="small"
            defaultValue={suspect.build}
            onChange={(value) => {
              addEntryToUpdate(suspect.id, { ...suspect, build: value });
            }}
            placeholder="Select Build"
          >
            {BUILDS_AND_HEIGHTS.map((build) => (
              <Select.Option key={build} value={build}>
                {build}
              </Select.Option>
            ))}
          </Select>

          <Typography.Text strong>Height:</Typography.Text>
          <Select
            size="small"
            defaultValue={suspect.height}
            onChange={(value) => {
              addEntryToUpdate(suspect.id, { ...suspect, height: value });
            }}
          >
            {BUILDS_AND_HEIGHTS.map((height) => (
              <Select.Option key={height} value={height}>
                {height}
              </Select.Option>
            ))}
          </Select>

          <SuspectFeatures suspect={suspect} addEntryToUpdate={addEntryToUpdate} />
        </div>
      </div>
    </Drawer>
  );
}

type SuspectFeaturesProps = {
  suspect: SuspectCard;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<SuspectCard>['addEntryToUpdate'];
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
    <div>
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

const BUILDS_AND_HEIGHTS = ['S', 'M', 'L'];

export const FEATURES_BY_GROUP = [
  {
    title: 'Hair Length',
    features: [
      { id: 'shortHair', label: 'Short Hair' },
      { id: 'longHair', label: 'Long Hair' },
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
