import { Button, Flex, Select } from 'antd';
import { useState } from 'react';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

type CrimeTagTypeaheadProps = Pick<CrimesHediondosInnerContentProps, 'allTags'> & {
  onSelect: (value: string) => void;
};

export function CrimeTagTypeahead({ allTags, onSelect }: CrimeTagTypeaheadProps) {
  return (
    <Select
      showSearch
      mode="tags"
      placeholder="Add new tag"
      options={allTags}
      style={{ width: '200px' }}
      autoClearSearchValue
      maxCount={1}
      onSelect={onSelect}
      allowClear
      defaultActiveFirstOption={false}
      size="small"
    />
  );
}

type CrimeTagAddMultipleProps = Pick<CrimesHediondosInnerContentProps, 'allTags'> & {
  onSelect: (value: string[]) => void;
};

export function CrimeTagAddMultiple({ onSelect }: CrimeTagAddMultipleProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSelect = () => {
    onSelect(selectedTags.map((e) => e.trim().toLowerCase()));
    setSelectedTags([]);
  };

  return (
    <Flex gap={6}>
      <Select
        showSearch
        mode="tags"
        placeholder="Add new tag"
        options={[]}
        style={{ width: '200px' }}
        autoClearSearchValue
        allowClear
        value={selectedTags}
        onChange={setSelectedTags}
        tokenSeparators={[',']}
        onClear={() => setSelectedTags([])}
        defaultActiveFirstOption={false}
        size="small"
      />
      <Button onClick={handleSelect} disabled={selectedTags.length === 0}>
        Add
      </Button>
    </Flex>
  );
}
