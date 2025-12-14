import { Flex, Select, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import type { SuspectExtendedInfo } from 'types';
import { ECONOMIC_CLASS_OPTIONS, EDUCATION_LEVEL_OPTIONS, SEXUAL_ORIENTATION_OPTIONS } from './options';

const sexualOrientation = SEXUAL_ORIENTATION_OPTIONS.map((option) => ({
  value: `sexualOrientation.${option.value}`,
  label: `Sexual Orientation: ${option.label}`,
}));

const educationLevel = EDUCATION_LEVEL_OPTIONS.map((option) => ({
  value: `educationLevel.${option.value}`,
  label: `Education Level: ${option.label}`,
}));

const economicClass = ECONOMIC_CLASS_OPTIONS.map((option) => ({
  value: `economicClass.${option.value}`,
  label: `Economic Class: ${option.label}`,
}));

const flatInfo = [...sexualOrientation, ...educationLevel, ...economicClass];

export function ExtendedInfoFilterBar() {
  const { addParam, queryParams } = useQueryParams();

  return (
    <Flex align="center" className="my-2" gap={8}>
      <Typography.Text>Extended Info Highlight:</Typography.Text>{' '}
      <Select
        allowClear
        onChange={(value) => addParam('activeExtendedInfo', value)}
        options={flatInfo}
        size="small"
        style={{ width: 275 }}
        value={queryParams.get('activeExtendedInfo') || undefined}
      />
    </Flex>
  );
}

type ActiveExtendedInfoProps = {
  entry: SuspectExtendedInfo;
  addEntryToUpdate: (id: string, item: SuspectExtendedInfo) => void;
  activeExtendedInfo?: string;
};

export function ActiveExtendedInfoSwitch({
  entry,
  addEntryToUpdate,
  activeExtendedInfo,
}: ActiveExtendedInfoProps) {
  const { currentValue, checked } = useMemo(() => {
    const [group, key] = (activeExtendedInfo ?? '').split('.');
    if (!group || !key)
      return {
        currentValue: undefined,
        checked: false,
      };

    if (group === 'sexualOrientation') {
      return {
        currentValue: entry.sexualOrientation,
        checked: entry.sexualOrientation === key,
      };
    }
    if (group === 'educationLevel') {
      return {
        currentValue: entry.educationLevel,
        checked: entry.educationLevel === key,
      };
    }
    if (group === 'economicClass') {
      return {
        currentValue: entry.economicClass,
        checked: entry.economicClass === key,
      };
    }
    return {
      currentValue: undefined,
      checked: false,
    };
  }, [activeExtendedInfo, entry]);

  const updateExtendedSuspectInfo = (id: string, activeExtendedInfo: string) => {
    const [group, key] = activeExtendedInfo.split('.');
    if (!group || !key) return;

    const updatedEntry: SuspectExtendedInfo = { ...entry };

    if (group === 'sexualOrientation') {
      updatedEntry.sexualOrientation = checked ? '' : key;
    }
    if (group === 'educationLevel') {
      updatedEntry.educationLevel = checked ? '' : key;
    }
    if (group === 'economicClass') {
      updatedEntry.economicClass = checked ? '' : key;
    }

    addEntryToUpdate(id, updatedEntry);
  };

  if (!activeExtendedInfo) return null;

  return (
    <Flex className={clsx('mt-2 mb-4', { 'missing-value': !currentValue })} gap={8}>
      <Typography.Text keyboard>{activeExtendedInfo}:</Typography.Text>
      <Switch
        checked={checked}
        checkedChildren={'✓'}
        onChange={() => updateExtendedSuspectInfo(entry.id, activeExtendedInfo)}
        unCheckedChildren={'✗'}
      />
    </Flex>
  );
}
