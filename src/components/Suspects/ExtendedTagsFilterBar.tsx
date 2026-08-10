import { useQueryParams } from '@hooks/useQueryParams';
import type { SuspectExtendedInfoData } from '@types';
import { Flex, Select, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { useMemo } from 'react';

type ExtendedTagsFilterBarProps = {
  suspectsExtendedInfo: Dictionary<SuspectExtendedInfoData>;
};

export function ExtendedTagsFilterBar({ suspectsExtendedInfo }: ExtendedTagsFilterBarProps) {
  const { addParam, queryParams } = useQueryParams();

  const tagsOptions = useMemo(() => {
    const set = new Set<string>();
    Object.values(suspectsExtendedInfo).forEach((info) => {
      if (info.tags) {
        info.tags.forEach((tag) => {
          set.add(tag);
        });
      }
    });
    return Array.from(set).map((tag) => ({
      value: tag,
      label: tag,
    }));
  }, [suspectsExtendedInfo]);

  return (
    <Flex
      align="center"
      className="my-2"
      gap={8}
    >
      <Typography.Text>Extended Info Highlight:</Typography.Text>{' '}
      <Select
        allowClear
        onChange={(value) => addParam('activeTag', value)}
        options={tagsOptions}
        size="small"
        style={{ width: 275 }}
        value={queryParams.get('activeTag') || undefined}
      />
    </Flex>
  );
}

type ActiveExtendedTagSwitchProps = {
  entry: SuspectExtendedInfoData;
  addEntryToUpdate: (id: string, item: SuspectExtendedInfoData) => void;
  activeTag?: string | null;
};

export function ActiveExtendedTagSwitch({
  entry,
  addEntryToUpdate,
  activeTag,
}: ActiveExtendedTagSwitchProps) {
  if (!activeTag) return null;

  const updateExtendedSuspectInfo = (id: string, activeTag: string, checked: boolean) => {
    const updatedEntry = {
      ...entry,
      tags: checked
        ? [...(entry.tags || []), activeTag].sort((a, b) => a.localeCompare(b))
        : entry.tags?.filter((tag) => tag !== activeTag),
    };
    addEntryToUpdate(id, updatedEntry);
  };

  return (
    <Flex
      className={clsx('mt-2 mb-4', { 'missing-value': !entry.tags?.includes(activeTag) })}
      gap={8}
    >
      <Switch
        checked={entry.tags?.includes(activeTag)}
        checkedChildren={'✓'}
        onChange={(checked) => updateExtendedSuspectInfo(entry.id, activeTag, checked)}
        unCheckedChildren={'✗'}
      />
      <Typography.Text keyboard>{activeTag}</Typography.Text>
    </Flex>
  );
}
