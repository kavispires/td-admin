import type { CrimesHediondosCard } from 'types';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';
import { Space, Tag } from 'antd';
import { cloneDeep } from 'lodash';
import { removeDuplicates } from 'utils';
import { CrimeTagAddMultiple, CrimeTagTypeahead } from './CrimeTagTypeahead';

type CardEditTagsProps = Pick<CrimesHediondosInnerContentProps, 'allTags' | 'onUpdateCard'> & {
  card: CrimesHediondosCard;
};

export function CardEditTags({ card, allTags, onUpdateCard }: CardEditTagsProps) {
  const updateCurrentTags = (tag: string) => {
    const copy = cloneDeep(card);
    if (copy.tags?.includes(tag)) {
      copy.tags = copy.tags?.filter((t) => t !== tag);
    } else {
      copy.tags = removeDuplicates([...(copy.tags ?? []), tag]).sort();
    }
    onUpdateCard(copy);
  };

  const updateMultipleTags = (tags: string[]) => {
    const copy = cloneDeep(card);
    copy.tags = removeDuplicates([...(copy.tags ?? []), ...tags]).sort();
    onUpdateCard(copy);
  };

  return (
    <Space wrap>
      <Space size="small">
        New tag:
        <CrimeTagTypeahead allTags={allTags} onSelect={updateCurrentTags} />
      </Space>
      <Space size="small">
        All multiple tags:
        <CrimeTagAddMultiple allTags={allTags} onSelect={updateMultipleTags} />
      </Space>
      <ul className="all-tags">
        {allTags.map(({ value, count }) => (
          <Tag
            key={`all-tags-${value}`}
            color={card.tags?.includes(value) ? 'yellow' : undefined}
            className="all-tags__tag"
            onClick={() => updateCurrentTags(value)}
          >
            {value} ({count})
          </Tag>
        ))}
      </ul>
    </Space>
  );
}
