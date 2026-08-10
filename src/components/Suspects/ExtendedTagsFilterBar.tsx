import { useQueryParams } from '@hooks/useQueryParams';
import type { SuspectExtendedInfoData } from '@types';
import { Button, Flex, Select, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

type ExtendedTagsFilterBarProps = {
  suspectsExtendedInfo: Dictionary<SuspectExtendedInfoData>;
};

export function ExtendedTagsFilterBar({ suspectsExtendedInfo }: ExtendedTagsFilterBarProps) {
  const { addParam, queryParams } = useQueryParams();
  const appliedActiveTag = queryParams.get('activeTag') || undefined;
  const [draftActiveTag, setDraftActiveTag] = useState<string | undefined>(appliedActiveTag);

  useEffect(() => {
    setDraftActiveTag(appliedActiveTag);
  }, [appliedActiveTag]);

  const normalizedDraftActiveTag = draftActiveTag?.trim() || undefined;
  const normalizedAppliedActiveTag = appliedActiveTag?.trim() || undefined;

  const tagsOptions = useMemo(() => {
    const set = new Set<string>();

    Object.values(suspectsExtendedInfo).forEach((info) => {
      if (info.tags) {
        info.tags.forEach((tag) => {
          set.add(tag);
        });
      }
    });

    if (normalizedDraftActiveTag) {
      set.add(normalizedDraftActiveTag);
    }

    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({
        value: tag,
        label: tag,
      }));
  }, [suspectsExtendedInfo, normalizedDraftActiveTag]);

  const applyActiveTag = () => {
    addParam('activeTag', normalizedDraftActiveTag);
  };

  const hasDraftChanges = normalizedDraftActiveTag !== normalizedAppliedActiveTag;

  return (
    <Flex
      align="center"
      className="my-2"
      gap={8}
    >
      <Typography.Text>Tag Highlight:</Typography.Text>{' '}
      <Select
        allowClear
        maxCount={1}
        mode="tags"
        onChange={(value) => setDraftActiveTag(value.at(-1))}
        options={tagsOptions}
        placeholder="Select or type a tag"
        size="small"
        style={{ width: 275 }}
        value={draftActiveTag ? [draftActiveTag] : []}
      />
      <Button
        disabled={!hasDraftChanges}
        onClick={applyActiveTag}
        size="small"
        type="primary"
      >
        Apply
      </Button>
      {!!normalizedAppliedActiveTag && (
        <Button
          onClick={() => setDraftActiveTag(undefined)}
          size="small"
        >
          Clear
        </Button>
      )}
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

  const hasTag = entry.tags?.includes(activeTag) ?? false;

  const updateExtendedSuspectInfo = (id: string, activeTag: string, checked: boolean) => {
    const updatedEntry = {
      ...entry,
      tags: checked
        ? Array.from(new Set([...(entry.tags || []), activeTag])).sort((a, b) => a.localeCompare(b))
        : (entry.tags || []).filter((tag) => tag !== activeTag),
    };

    addEntryToUpdate(id, updatedEntry);
  };

  return (
    <Flex
      className={clsx('mt-2 mb-4', { 'missing-value': !hasTag })}
      gap={8}
    >
      <Switch
        checked={hasTag}
        checkedChildren={'✓'}
        onChange={(checked) => updateExtendedSuspectInfo(entry.id, activeTag, checked)}
        unCheckedChildren={'✗'}
      />
      <Typography.Text keyboard>{activeTag}</Typography.Text>
    </Flex>
  );
}
