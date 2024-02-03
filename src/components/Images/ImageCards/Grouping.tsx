import './dev-image-cards.scss';

import { Button, Card, FloatButton, Image, Layout, Popover, Select, Space, Switch, Tag } from 'antd';
import { TransparentButton } from 'components/Common';
import { useCardWidth } from 'hooks/useCardWidth';
import { useMemo, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

import {
  BarChartOutlined,
  ExpandOutlined,
  FileImageOutlined,
  ForkOutlined,
  LoadingOutlined,
  SaveOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { ImageCard } from '../ImageCard';
import { UseImageCardsRelationshipDataReturnValue, useRandomGroups } from './hooks';
import { RelationshipCountTag } from './RelationshipCountTag';

type GroupingProps = {
  query: UseImageCardsRelationshipDataReturnValue;
};

export function Grouping({ query }: GroupingProps) {
  const [sampleSize, setSampleSize] = useState(15);
  const [tagThreshold, setTagThreshold] = useState(5);
  const [cardSize, setCardSize] = useState(120);
  const [showIds, setShowIds] = useState(false);
  // Get screen size and calculate how many 120px cards can fit in a row
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();
  const cardQuantity = useMemo(() => {
    return Math.min(Math.ceil(containerWidth / (cardSize + 16)), sampleSize);
  }, [containerWidth, sampleSize, cardSize]);
  const [cardWidth] = useCardWidth(cardQuantity + 1, { minWidth: 100 });

  const { data, isDirty, setDirty, isSuccess, isSaving, save, stats } = query;

  const cardRef = useRef<HTMLDivElement>(null);

  // Selects a random deck, but gives option select for a specific deck (1-10)
  const { cardIds, cards, onSelect, selection, relate, nextSet, deselectAll, cycles, filters } =
    useRandomGroups(data, setDirty, sampleSize, tagThreshold);

  const onNextSet = () => {
    nextSet();
    cardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const statsContent = (
    <ul>
      <li>Completion: {Math.floor((stats.total * 100) / (10 * 252))}%</li>
      <li>Total Relationships: {stats.total}</li>
      <li>Complete: {stats.complete}</li>
      <li>Overdone: {stats.overdone}</li>
      <li>Single Match: {stats.single}</li>
    </ul>
  );

  return (
    <Layout.Content className="dev-content">
      {isSaving && <div>Saving...</div>}
      {isSuccess && (
        <Space className="space-container" direction="vertical" ref={ref}>
          <Space wrap className="contained space-container">
            <Popover content={statsContent} title="Stats" placement="bottom">
              <Button size="small" icon={<BarChartOutlined />}>
                Stats
              </Button>
            </Popover>
            <span>Filters:</span>
            <Switch
              checkedChildren="Use Cycles"
              unCheckedChildren="Any Card"
              checked={filters.useCycles}
              onChange={() => filters.toggleUseCycles()}
            />
            <Switch
              checkedChildren="Show Ids"
              unCheckedChildren="No Ids"
              checked={showIds}
              onChange={(c) => setShowIds(c)}
            />
            <Select
              onChange={(value) => setTagThreshold(value)}
              defaultValue={tagThreshold}
              className="sample-size-select"
              size="small"
            >
              <Select.Option value={1}>Tags: {'='} 0</Select.Option>
              <Select.Option value={3}>Tags: {'<'} 3</Select.Option>
              <Select.Option value={5}>Tags: {'<'} 5</Select.Option>
              <Select.Option value={10}>Tags: {'<'} 10</Select.Option>
              <Select.Option value={0}>Tags: Any</Select.Option>
            </Select>
            <Select
              onChange={(value) => setSampleSize(value)}
              defaultValue={sampleSize}
              className="sample-size-select"
              size="small"
            >
              <Select.Option value={9}>Cards: 9</Select.Option>
              <Select.Option value={15}>Cards: 15</Select.Option>
              <Select.Option value={30}>Cards: 30</Select.Option>
              <Select.Option value={50}>Cards: 50</Select.Option>
              <Select.Option value={100}>Cards: 100</Select.Option>
            </Select>
            <Select
              onChange={(value) => setCardSize(value)}
              defaultValue={cardSize}
              className="sample-size-select"
              size="small"
            >
              <Select.Option value={120}>Size: 120</Select.Option>
              <Select.Option value={150}>Size: 150</Select.Option>
              <Select.Option value={200}>Size: 200</Select.Option>
              <Select.Option value={300}>Size: 300</Select.Option>
            </Select>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={() => save({})}
              disabled={!isDirty}
              loading={isSaving}
              danger
            >
              Save
            </Button>
          </Space>
          <Card
            title="Card Relationship Matching"
            extra={
              <span>
                <FileImageOutlined /> {cycles}
              </span>
            }
            className="image-card-categorizer-card"
            ref={cardRef}
          >
            <Image.PreviewGroup>
              <div
                className="image-cards-group"
                style={{ gridTemplateColumns: `repeat(${Math.max(cardQuantity, 1)}, 1fr)` }}
              >
                {cardIds.map((cardId, index) => {
                  const isSelected = selection.includes(cardId);
                  const card = cards[index];

                  return (
                    <div className="image-card-card__image" key={cardId}>
                      <TransparentButton
                        onClick={() => onSelect(cardId)}
                        active={isSelected}
                        className="image-cards-group__button"
                        activeClass="image-cards-group__button--active"
                      >
                        <ImageCard id={cardId} width={cardWidth} preview={false} />
                        <div>
                          {showIds && <Tag>{cardId}</Tag>}
                          {/* <Button size="small">{isSelected ? 'Deselect' : 'Select'}</Button> */}
                          <RelationshipCountTag card={card} />
                        </div>
                      </TransparentButton>
                    </div>
                  );
                })}
              </div>
            </Image.PreviewGroup>
            <Actions
              isSaving={isSaving}
              isDirty={isDirty}
              selection={selection}
              relate={relate}
              deselectAll={deselectAll}
              onNextSet={onNextSet}
            />
          </Card>
          <div style={{ height: 100 }}></div>
        </Space>
      )}
    </Layout.Content>
  );
}

type ActionsProps = {
  isSaving: boolean;
  isDirty: boolean;
  selection: string[];
  relate: () => void;
  deselectAll: () => void;
  onNextSet: () => void;
};

const Actions = ({ isSaving, isDirty, selection, relate, deselectAll, onNextSet }: ActionsProps) => {
  if (isSaving) {
    return (
      <>
        <FloatButton icon={<LoadingOutlined />} />
      </>
    );
  }

  const onRelate = () => {
    if (selection.length < 2) return;
    relate();
  };

  return (
    // <FloatButton.Group shape="square" style={{ right: 24 }}>
    // </FloatButton.Group>
    <>
      {isDirty && (
        <FloatButton icon={<WarningOutlined />} type="primary" style={{ right: 24 + 70 + 70 + 70 }} />
      )}
      <FloatButton
        icon={<ExpandOutlined />}
        style={{ right: 24 + 70 + 70 }}
        // tooltip="Deselect"
        onClick={deselectAll}
      />
      <FloatButton
        icon={<ForkOutlined />}
        style={{ right: 24 + 70 }}
        type={selection.length < 2 ? 'default' : 'primary'}
        // tooltip="Relate"
        badge={{ count: selection.length, size: 'small' }}
        onClick={onRelate}
      />
      <FloatButton
        icon={<SyncOutlined />}
        style={{ right: 24 }}
        // tooltip="Next Set"
        onClick={onNextSet}
      />
    </>
  );
};
