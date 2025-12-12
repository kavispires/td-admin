import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Flex,
  Input,
  type InputProps,
  Radio,
  type RadioGroupProps,
  Segmented,
  Select,
  type SelectProps,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep, set } from 'lodash';
import { type ReactNode, useEffect, useState } from 'react';
import type { SuspectCard, SuspectExtendedInfo } from 'types';
import {
  AGE_OPTIONS,
  ALIGNMENT_OPTIONS,
  BUILD_OPTIONS,
  ECONOMIC_CLASS_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  FEATURES_BY_GROUP,
  GENDER_OPTIONS,
  HEIGHT_OPTIONS,
  MBTI_OPTIONS,
  RACE_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  ZODIAC_SIGN_OPTIONS,
} from './options';
import { SuspectImageCard } from './SuspectImageCard';

type SuspectDrawerProps = {
  suspects: Dictionary<SuspectCard>;
  suspectsExtendedInfos: Dictionary<SuspectExtendedInfo>;
  addSuspectEntryToUpdate: UseResourceFirestoreDataReturnType<SuspectCard>['addEntryToUpdate'];
  addExtendedInfoEntryToUpdate: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>['addEntryToUpdate'];
};

export function SuspectDrawer({
  suspects,
  suspectsExtendedInfos,
  addSuspectEntryToUpdate,
  addExtendedInfoEntryToUpdate,
}: SuspectDrawerProps) {
  const { removeParam, queryParams, addParam } = useQueryParams();
  const suspectId = queryParams.get('suspectId');
  const drawerTab = queryParams.get('drawerTab') || 'Basic';
  const suspect = suspects[suspectId ?? ''];

  const updateSuspectKeyValue = (suspectId: string, key: keyof SuspectCard | string, value: unknown) => {
    const suspect = suspects[suspectId];
    if (!suspect) return;

    if (suspect[key as keyof SuspectCard] === value) return;

    addSuspectEntryToUpdate(suspectId, {
      ...suspect,
      [key]: value,
    });
  };

  const updateExtendedKeyValue = (
    suspectId: string,
    key: keyof SuspectExtendedInfo | string,
    value: unknown,
  ) => {
    const suspectExtendedInfo = suspectsExtendedInfos[suspectId];
    if (!suspectExtendedInfo) return;

    if (suspectExtendedInfo[key as keyof SuspectExtendedInfo] === value) return;

    addExtendedInfoEntryToUpdate(suspectId, {
      ...suspectExtendedInfo,
      [key]: value,
    });
  };

  if (!suspect) return null;

  return (
    <Drawer
      footer={<Footer />}
      onClose={() => removeParam('suspectId')}
      open={!!suspect}
      placement="right"
      title={suspect.name.pt}
      width={400}
    >
      <div className="suspect__drawer">
        <div
          className="grid"
          style={{ gridTemplateColumns: '1fr 1.25fr', height: '100%', overflowY: 'auto' }}
        >
          <div>
            <div style={{ top: 64, position: 'fixed' }}>
              <SuspectImageCard cardId={suspect.id} cardWidth={100} />
            </div>
          </div>

          <Flex gap={4} vertical>
            <Segmented
              onChange={(value) => addParam('drawerTab', value)}
              options={['Basic', 'Features', 'Extended']}
              value={drawerTab}
            />
            <TextField
              defaultValue={suspect.name.pt}
              label="Name in PT"
              prefix={<span>🇧🇷</span>}
              suspect={suspect}
              suspectId={suspect.id}
              updater={addSuspectEntryToUpdate}
              valueKey="name.pt"
            />

            <TextField
              defaultValue={suspect.name.en}
              label="Name in EN"
              prefix={<span>🇺🇸</span>}
              suspect={suspect}
              suspectId={suspect.id}
              updater={addSuspectEntryToUpdate}
              valueKey="name.en"
            />

            <div>
              <Select
                onChange={(value) => updateSuspectKeyValue(suspect.id, 'age', value)}
                options={AGE_OPTIONS}
                placeholder="Select Age"
                // size="small"
                style={{ width: 128 }}
                value={suspect.age}
              />
            </div>
          </Flex>
        </div>
        {drawerTab === 'Basic' && (
          <SuspectBasicInfo key={suspectId} suspect={suspect} updateSuspectKeyValue={updateSuspectKeyValue} />
        )}

        {drawerTab === 'Features' && (
          <SuspectFeatures addEntryToUpdate={addSuspectEntryToUpdate} key={suspectId} suspect={suspect} />
        )}

        {drawerTab === 'Extended' && (
          <SuspectExtendedInfoForm
            addExtendedInfoEntryToUpdate={addExtendedInfoEntryToUpdate}
            key={suspectId}
            suspect={suspect}
            suspectExtendedInfo={suspectsExtendedInfos[suspect.id] || {}}
            updateExtendedKeyValue={updateExtendedKeyValue}
          />
        )}
      </div>
    </Drawer>
  );
}

function Footer() {
  const { queryParams, addParam } = useQueryParams();
  const suspectId = queryParams.get('suspectId') ?? '';

  const onNextSuspect = () => {
    const num = Number(suspectId?.split('-')[1]) ?? 0;
    console.log('num', num);
    if (num) {
      addParam('suspectId', `us-${(num + 1).toString().padStart(3, '0')}`);
    }
  };

  const onPreviousSuspect = () => {
    const num = Number(suspectId?.split('-')[1]) ?? 0;

    if (num && num > 1) {
      addParam('suspectId', `us-${(num - 1).toString().padStart(3, '0')}`);
    }
  };

  return (
    <Flex gap={8} justify="end">
      <Button onClick={onPreviousSuspect}>Previous</Button>
      <Button onClick={onNextSuspect}>Next</Button>
    </Flex>
  );
}

type TextFieldProps<TSuspect extends SuspectCard | SuspectExtendedInfo> = {
  /**
   * The ID of the suspect
   */
  suspectId: string;
  /**
   * The suspect object (SuspectCard or SuspectExtendedInfo)
   */
  suspect: TSuspect;
  /**
   * Label for the text field
   */
  label?: ReactNode;
  /**
   * Dot-notation path to the value in the suspect object (e.g., "name.pt")
   */
  valueKey: string;
  /**
   * Default value for the text field
   */
  defaultValue?: string;
  /**
   * Function to update the suspect in the store
   */
  updater: (id: string, value: TSuspect) => void;
} & Omit<InputProps, 'onChange' | 'value'>;

function TextField<TSuspect extends SuspectCard | SuspectExtendedInfo>({
  label,
  defaultValue,
  suspect,
  suspectId,
  updater,
  valueKey,
  ...rest
}: TextFieldProps<TSuspect>) {
  const [value, setValue] = useState(defaultValue || '');

  // Reset local state when suspect changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: set up name initial values
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [suspect.id]);

  const handleBlur = () => {
    if (suspectId && value !== defaultValue) {
      const copy = cloneDeep(suspect) as TSuspect;
      set(copy, valueKey, value);

      updater(suspect.id, copy);
    }
  };

  return (
    <Input
      onBlur={handleBlur}
      onChange={(e) => setValue(e.target.value)}
      placeholder={label ? String(label) : ''}
      value={value}
      {...rest}
    />
  );
}

type RadioSelectionGroupProps = {
  label: ReactNode;
  suspectId: string;
  valueKey: keyof SuspectCard | keyof SuspectExtendedInfo;
  value: string;
  options: RadioGroupProps['options'];
  updater: (id: string, key: string, value: string) => void;
};

function RadioSelectionGroup({
  label,
  suspectId,
  valueKey,
  value,
  options,
  updater,
}: RadioSelectionGroupProps) {
  return (
    <Flex vertical>
      <Typography.Text strong>{label}</Typography.Text>
      <Radio.Group
        onChange={(e) => updater(suspectId, valueKey, e.target.value)}
        options={options}
        size="small"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        value={value}
      />
    </Flex>
  );
}

type SelectionFieldProps = {
  label: ReactNode;
  suspectId: string;
  valueKey: keyof SuspectCard | keyof SuspectExtendedInfo;
  value: string;
  options: SelectProps['options'];
  updater: (id: string, key: string, value: string) => void;
  disabled?: boolean;
};

function SelectionField({
  label,
  suspectId,
  valueKey,
  value,
  options,
  updater,
  disabled,
}: SelectionFieldProps) {
  return (
    <Flex vertical>
      <Typography.Text strong>{label}</Typography.Text>
      <Select
        disabled={disabled}
        onChange={(value) => updater(suspectId, valueKey, value)}
        options={options}
        placeholder={typeof label === 'string' ? label : ''}
        style={{ width: '100%', marginTop: 6 }}
        value={value}
      />
    </Flex>
  );
}

type SuspectBasicInfoProps = {
  suspect: SuspectCard;
  updateSuspectKeyValue: (id: string, key: string, value: unknown) => void;
};

function SuspectBasicInfo({ suspect, updateSuspectKeyValue }: SuspectBasicInfoProps) {
  return (
    <div className="grid grid-2 gap-4 my-4">
      <RadioSelectionGroup
        label="Gender"
        options={GENDER_OPTIONS}
        suspectId={suspect.id}
        updater={updateSuspectKeyValue}
        value={suspect.gender}
        valueKey="gender"
      />

      <RadioSelectionGroup
        label="Race"
        options={RACE_OPTIONS}
        suspectId={suspect.id}
        updater={updateSuspectKeyValue}
        value={suspect.race}
        valueKey="race"
      />

      <RadioSelectionGroup
        label="Build"
        options={BUILD_OPTIONS}
        suspectId={suspect.id}
        updater={updateSuspectKeyValue}
        value={suspect.build}
        valueKey="build"
      />

      <RadioSelectionGroup
        label="Height"
        options={HEIGHT_OPTIONS}
        suspectId={suspect.id}
        updater={updateSuspectKeyValue}
        value={suspect.height}
        valueKey="height"
      />
    </div>
  );
}

type SuspectExtendedInfoProps = {
  suspect: SuspectCard;
  suspectExtendedInfo: SuspectExtendedInfo;
  updateExtendedKeyValue: (id: string, key: string, value: unknown) => void;
  addExtendedInfoEntryToUpdate: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>['addEntryToUpdate'];
};

function SuspectExtendedInfoForm({
  suspect,
  suspectExtendedInfo,
  updateExtendedKeyValue,
  addExtendedInfoEntryToUpdate,
}: SuspectExtendedInfoProps) {
  const inferredField = (
    <Tooltip title="This field is inferred from Testimony Answers">
      <InfoCircleOutlined />
    </Tooltip>
  );

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Title italic level={5}>
          Extended Info
        </Typography.Title>
        <Flex gap={4} vertical>
          <Typography.Text strong>Persona</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.persona?.pt || ''}
            label="Persona in PT"
            prefix={<span>🇧🇷</span>}
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="persona.pt"
          />

          <TextField
            defaultValue={suspectExtendedInfo.persona?.en || ''}
            label="Persona in EN"
            prefix={<span>🇺🇸</span>}
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="persona.en"
          />
        </Flex>

        <Flex gap={4} vertical>
          <Typography.Text strong>Prompt</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.prompt || ''}
            label="Prompt"
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="prompt"
          />
        </Flex>

        <Flex gap={4} vertical>
          <Typography.Text strong>Description</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.description || ''}
            label="Description"
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="description"
          />
        </Flex>
      </Flex>
      <div className="grid grid-2 gap-4 my-4">
        <Flex gap={6} vertical>
          <Typography.Text strong>Animal</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.animal || ''}
            label="Animal"
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="animal"
          />
        </Flex>

        <Flex gap={6} vertical>
          <Typography.Text strong>Occupation</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.profession || ''}
            label="Occupation"
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="profession"
          />
        </Flex>

        <Flex gap={6} vertical>
          <Typography.Text strong>Ethnicity</Typography.Text>
          <TextField
            defaultValue={suspectExtendedInfo.ethnicity || ''}
            label="Ethnicity"
            suspect={suspectExtendedInfo}
            suspectId={suspect.id}
            updater={addExtendedInfoEntryToUpdate}
            valueKey="ethnicity"
          />
        </Flex>

        <SelectionField
          disabled
          label={<>Zodiac Sign {inferredField}</>}
          options={ZODIAC_SIGN_OPTIONS}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.zodiacSign}
          valueKey="zodiacSign"
        />

        <SelectionField
          disabled
          label={<>Alignment {inferredField}</>}
          options={ALIGNMENT_OPTIONS}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.alignment}
          valueKey="alignment"
        />

        <SelectionField
          disabled
          label={<>MBTI {inferredField}</>}
          options={MBTI_OPTIONS.map((v) => ({ label: v, value: v }))}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.mbti}
          valueKey="mbti"
        />

        <RadioSelectionGroup
          label="Sexual Orientation"
          options={SEXUAL_ORIENTATION_OPTIONS}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.sexualOrientation}
          valueKey="sexualOrientation"
        />

        <RadioSelectionGroup
          label="Economic Status"
          options={ECONOMIC_CLASS_OPTIONS}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.economicClass}
          valueKey="economicClass"
        />

        <RadioSelectionGroup
          label="Education Level"
          options={EDUCATION_LEVEL_OPTIONS}
          suspectId={suspect.id}
          updater={updateExtendedKeyValue}
          value={suspectExtendedInfo.educationLevel}
          valueKey="educationLevel"
        />

        <Flex gap={4} vertical>
          <Typography.Text strong>Personality Traits</Typography.Text>
          <Select
            defaultValue={suspectExtendedInfo.personalityTraits ?? []}
            mode="tags"
            onChange={(personalityTraits) =>
              updateExtendedKeyValue(suspect.id, 'personalityTraits', personalityTraits.sort())
            }
            // options={[]}
            placeholder="Personality Traits"
            size="small"
            style={{ width: '100%' }}
          />
        </Flex>
      </div>
    </>
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
    <Flex gap={6} vertical>
      <Typography.Title italic level={5}>
        Image Features for gb style
      </Typography.Title>
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
    </Flex>
  );
}
