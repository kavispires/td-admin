import { Drawer, Flex, Input, Radio, Select, Switch, Typography } from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import type { SuspectCard } from 'types';
import { SuspectImageCard } from './SuspectImageCard';

const AGE_OPTIONS = ['18-21', '21-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90'].map((v) => ({
  label: v,
  value: v,
}));

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Other', value: 'other' },
];

const ETHNICITY_OPTIONS = [
  { label: 'Caucasian', value: 'caucasian' },
  { label: 'Black', value: 'black' },
  { label: 'Asian', value: 'asian' },
  { label: 'Latino', value: 'latino' },
  { label: 'Indigenous', value: 'indigenous' },
  { label: 'Indian', value: 'indian' },
  { label: 'Middle Eastern', value: 'middle-eastern' },
  { label: 'Mixed', value: 'mixed' },
  { label: 'Other', value: 'other' },
];

type SuspectDrawerProps = Pick<UseResourceFirestoreDataReturnType<SuspectCard>, 'data' | 'addEntryToUpdate'>;

export function SuspectDrawer({ data, addEntryToUpdate }: SuspectDrawerProps) {
  const { removeParam, queryParams } = useQueryParams();
  const suspectId = queryParams.get('suspectId');
  const suspect = data[suspectId ?? ''];

  const [namePt, setNamePt] = useState(suspect?.name.pt || '');
  const [nameEn, setNameEn] = useState(suspect?.name.en || '');
  const [note, setNote] = useState(suspect?.note || '');

  // Reset local state when suspect changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (suspect) {
      setNamePt(suspect.name.pt);
      setNameEn(suspect.name.en);
      setNote(suspect.note || '');
    }
  }, [suspect?.id]);

  // Debounce name pt updates
  useDebounce(
    () => {
      if (suspect && namePt !== suspect.name.pt) {
        addEntryToUpdate(suspect.id, {
          ...suspect,
          name: { ...suspect.name, pt: namePt },
        });
      }
    },
    500,
    [namePt],
  );

  // Debounce name en updates
  useDebounce(
    () => {
      if (suspect && nameEn !== suspect.name.en) {
        addEntryToUpdate(suspect.id, {
          ...suspect,
          name: { ...suspect.name, en: nameEn },
        });
      }
    },
    500,
    [nameEn],
  );

  // Debounce note updates
  useDebounce(
    () => {
      if (suspect && note !== suspect.note) {
        addEntryToUpdate(suspect.id, {
          ...suspect,
          note,
        });
      }
    },
    500,
    [note],
  );

  if (!suspect) return null;

  const name = {
    pt: namePt,
    en: nameEn,
  };

  return (
    <Drawer
      onClose={() => removeParam('suspectId')}
      open={!!suspect}
      placement="right"
      title={suspect.name.pt}
      width={400}
    >
      <div className="suspect__drawer">
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.25fr' }}>
          <SuspectImageCard id={suspect.id} width={100} />

          <Flex gap={4} key={`${name.pt}-${name.en}`} vertical>
            <DualLanguageTextField language="pt" onChange={(e) => setNamePt(e.target.value)} value={name} />
            <DualLanguageTextField language="en" onChange={(e) => setNameEn(e.target.value)} value={name} />
            <div>
              <Select
                onChange={(value) => {
                  addEntryToUpdate(suspect.id, {
                    ...suspect,
                    age: value,
                  });
                }}
                options={AGE_OPTIONS}
                placeholder="Select Age"
                size="small"
                style={{ width: 80 }}
                value={suspect.age}
              />
            </div>
            <div>
              <Select
                onChange={(value) => {
                  addEntryToUpdate(suspect.id, {
                    ...suspect,
                    gender: value,
                  });
                }}
                options={GENDER_OPTIONS}
                size="small"
                style={{ width: 120 }}
                value={suspect.gender}
              />
            </div>
            <div>
              <Select
                onChange={(value) => {
                  addEntryToUpdate(suspect.id, {
                    ...suspect,
                    ethnicity: value,
                  });
                }}
                options={ETHNICITY_OPTIONS}
                size="small"
                style={{ width: 150 }}
                value={suspect.ethnicity}
              />
            </div>
            <div>
              <Input onChange={(e) => setNote(e.target.value)} size="small" value={note} />
            </div>
          </Flex>
        </div>

        <div className="grid grid-2">
          <Flex vertical>
            <Typography.Text strong>Build</Typography.Text>
            <Radio.Group
              onChange={(e) => {
                addEntryToUpdate(suspect.id, { ...suspect, build: e.target.value });
              }}
              options={BUILDS}
              size="small"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
              value={suspect.build}
            />
          </Flex>
          <Flex vertical>
            <Typography.Text strong>Height</Typography.Text>
            <Radio.Group
              onChange={(e) => {
                addEntryToUpdate(suspect.id, { ...suspect, height: e.target.value });
              }}
              options={HEIGHTS}
              size="small"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
              value={suspect.height}
            />
          </Flex>
        </div>
        <SuspectFeatures addEntryToUpdate={addEntryToUpdate} suspect={suspect} />
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
        <div className="my-4" key={group.title}>
          <Typography.Text strong>{group.title}</Typography.Text>
          {group.features.map((feature) => (
            <Flex className="my-2" gap={4} key={feature.id}>
              <Switch
                checked={features.includes(feature.id)}
                onChange={() => onUpdateFeature(feature.id)}
                size="small"
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
    title: 'Specific',
    features: [
      { id: 'buttonShirt', label: 'Button Shirt' },
      { id: 'showTeeth', label: 'Showing Teeth' },
      { id: 'avoidingCamera', label: 'Avoiding Camera' },
      { id: 'hairyChest', label: 'Exposed Hairy Chest' },
    ],
  },
  {
    title: 'Accessories',
    features: [
      { id: 'noAccessories', label: 'No Accessories' },
      { id: 'glasses', label: 'Glasses' },
      { id: 'piercings', label: 'Piercings' },
      { id: 'earrings', label: 'Earrings' },
      { id: 'necklace', label: 'Necklace' },
      { id: 'hat', label: 'Hat' },
      { id: 'scarf', label: 'Scarf' },
      { id: 'hoodie', label: 'Hoodie' },
      { id: 'tie', label: 'Tie' },
      { id: 'headscarf', label: 'Headscarf/Bandana' },
      { id: 'bow', label: 'Bow' },
      { id: 'wearingFlowers', label: 'Wearing Flowers' },
      { id: 'hairTie', label: 'Hair Tie' },
    ],
  },
  {
    title: 'Clothing',
    features: [
      { id: 'whiteShirt', label: 'White Shirt' },
      { id: 'blackClothes', label: 'Black Clothes' },
      { id: 'blueClothes', label: 'Blue Clothes' },
      { id: 'redClothes', label: 'Red Clothes' },
      { id: 'greenClothes', label: 'Green Clothes' },
      { id: 'yellowClothes', label: 'Yellow Clothes' },
      { id: 'purpleClothes', label: 'Purple Clothes' },
      { id: 'pinkClothes', label: 'Pink Clothes' },
      { id: 'orangeClothes', label: 'Orange Clothes' },
      { id: 'brownClothes', label: 'Brown Clothes' },
      { id: 'patternedShirt', label: 'Patterned Shirt' },
      { id: 'wearingStripes', label: 'Wearing Stripes' },
    ],
  },
];
