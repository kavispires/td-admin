import './CrimesHediondosCategorizer.scss';
import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Select, Space, Spin, Tag } from 'antd';
import { TagState } from 'components/Common/ResponseState';
import { CrimeItemCard } from 'components/CrimesHediondos';
import { PageLayout } from 'components/Layout';
import { useCrimesHediondosData } from 'hooks/useCrimesHediondosData';
import { useCrimesHediondosTags } from 'hooks/useCrimesHediondosTags';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import type { CrimesHediondosCard } from 'types';

function CrimesHediondosCategorizer() {
  /**
   * TODO
   * - Load weapons or evidence
   * - Convert to array
   * - Set initial index
   * - Load previously created tags
   * - Create and keep list of existing tags
   * - Ability to select previous tag or creating brand new one
   * - Navigation buttons
   */
  const { data, isLoading, isSuccess, error } = useCrimesHediondosData();

  return (
    <PageLayout
      title="Crimes Hediondos Categorizer"
      extra={<TagState hasResponseData={!!data} isLoading={isLoading} error={error as ResponseError} />}
    >
      <Layout.Content className="content content--padded">
        {isLoading && <Spin size="large" />}

        {isSuccess && data.length > 1 && <CHDataWrapper data={data} />}
      </Layout.Content>
    </PageLayout>
  );
}

type CHDataWrapperProps = {
  data: CrimesHediondosCard[];
};

function CHDataWrapper({ data }: CHDataWrapperProps) {
  const [isProcessing] = useState(false);
  const { tags, cards, tagsArr, updateCardTags, prepareJson } = useCrimesHediondosTags(data);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [jsons, setJsons] = useState<any>({});

  const card = data[currentCardIndex];

  const updateCurrentTags = (tag: Tag) => {
    setCurrentTags((prevState) => {
      const entry = [...prevState];
      const index = entry.indexOf(tag);
      if (index === -1) {
        entry.push(tag);
      } else {
        entry.splice(index, 1);
      }

      return entry;
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setCurrentTags(cards && cards?.[card.id]?.length > 0 ? cards[card.id] : (card.tags ?? []));
  }, [card.id, card.tags]);

  const onSaveTags = () => {
    updateCardTags(card.id, [...currentTags]);
  };

  const goToCard = (value: number) => {
    onSaveTags();
    setCurrentCardIndex((i) => i + value);
  };

  const onSave = () => {
    // TODO: Make available the two json files
    setJsons(prepareJson());
  };

  return (
    <div className="h-container">
      <div className="h-image-container">
        <CrimeItemCard item={card} cardWidth={75} />
        <h3>
          <span>{card.name.en}</span> | <span>{card.name.pt}</span>
        </h3>
      </div>

      {!isProcessing && (
        <div>
          <CHTagSelect
            tagsArr={tagsArr}
            currentTags={currentTags}
            cardId={card.id}
            setCurrentTags={setCurrentTags}
          />
        </div>
      )}

      <Navigation goToCard={goToCard} currentCardIndex={currentCardIndex} data={data} />

      <Space className="my-4">
        <Button size="large" type="primary" onClick={onSave}>
          Save
        </Button>
      </Space>

      <ul className="all-tags">
        {tagsArr.map((tag) => (
          <Tag
            key={`all-tags-${tag}`}
            color={currentTags.includes(tag) ? 'yellow' : undefined}
            className="all-tags__tag"
            onClick={() => updateCurrentTags(tag)}
          >
            {tag} ({tags[tag].length})
          </Tag>
        ))}
      </ul>

      <JsonDisplay jsons={jsons} />
    </div>
  );
}

function CHTagSelect({
  tagsArr,
  currentTags,
  cardId,
  setCurrentTags,
}: {
  tagsArr: Tag[];
  currentTags: string[];
  cardId: CardId;
  setCurrentTags: (tags: string[]) => void;
}) {
  const handleChange = (e: string[]) => setCurrentTags(e);
  const [newTags, setNewTags] = useState<string[]>([]);

  const handleSearch = (query = '') => {
    setNewTags(query.trim().split(' '));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setNewTags([]);
  }, [cardId]);

  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder="Please select"
      value={currentTags}
      onChange={handleChange}
      onSearch={handleSearch}
      className="h-select"
    >
      {newTags.map((tag) => (
        <Select.Option key={`custom-option-${tag}`} value={tag}>
          {tag}
        </Select.Option>
      ))}
      {tagsArr.map((tag) => (
        <Select.Option key={`select-option-${tag}`} value={tag}>
          {tag}
        </Select.Option>
      ))}
    </Select>
  );
}

function JsonDisplay({ jsons }: { jsons: any }) {
  const [, copyToClipboard] = useCopyToClipboard();

  const weapons = jsons?.weapons ?? {};
  const evidence = jsons?.evidence ?? {};

  return (
    <div className="json-container">
      <Button
        size="small"
        onClick={() => copyToClipboard(JSON.stringify(weapons, null, 2))}
        icon={<CopyOutlined />}
      >
        Copy Weapons
      </Button>
      <Button
        size="small"
        onClick={() => copyToClipboard(JSON.stringify(evidence, null, 2))}
        icon={<CopyOutlined />}
      >
        Copy Evidence
      </Button>
      {weapons && (
        <Input.TextArea
          name="output"
          id=""
          cols={15}
          rows={10}
          readOnly
          value={JSON.stringify(weapons, null, 4)}
        />
      )}
      {evidence && (
        <Input.TextArea
          name="output"
          id=""
          cols={15}
          rows={10}
          readOnly
          value={JSON.stringify(evidence, null, 4)}
        />
      )}
      <Button size="small" target="_blank" href="">
        GH Weapons Json
      </Button>
      <Button size="small" target="_blank" href="">
        GH Evidence Json
      </Button>
    </div>
  );
}

type NavigationProps = {
  goToCard: (v: number) => void;
  currentCardIndex: number;
  data: CrimesHediondosCard[];
};

function Navigation({ goToCard, currentCardIndex, data }: NavigationProps) {
  return (
    <Space className="margin-2" wrap>
      <Button onClick={() => goToCard(-currentCardIndex)} disabled={currentCardIndex === 10}>
        First (0)
      </Button>
      <Button onClick={() => goToCard(-10)} disabled={currentCardIndex === 9}>
        Prev 10 ({currentCardIndex - 10})
      </Button>
      <Button onClick={() => goToCard(-1)} disabled={currentCardIndex === 0}>
        Prev ({currentCardIndex - 1})
      </Button>
      <Button onClick={() => goToCard(1)} disabled={currentCardIndex === data.length - 1}>
        Next ({currentCardIndex + 1})
      </Button>
      <Button onClick={() => goToCard(10)} disabled={currentCardIndex + 10 >= data.length - 1}>
        Next 10 ({currentCardIndex + 10})
      </Button>
      <Button
        onClick={() => goToCard(data.length - 1 - currentCardIndex)}
        disabled={currentCardIndex === data.length - 1}
      >
        Last ({data.length - 1})
      </Button>
    </Space>
  );
}

export default CrimesHediondosCategorizer;
