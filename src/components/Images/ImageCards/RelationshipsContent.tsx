import {
  ExpandOutlined,
  FileImageOutlined,
  ForkOutlined,
  LoadingOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Card, FloatButton, Image, Tooltip } from 'antd';
import { TransparentButton } from 'components/Common';
import { IdTag } from 'components/Common/IdTag';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { isEmpty } from 'lodash';
import { useMemo, useRef } from 'react';
import { useMeasure } from 'react-use';
import { ImageCard } from '../ImageCard';
import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';
import { RelationshipCountTag } from './RelationshipCountTag';

export function RelationshipsContent() {
  const {
    query: { isDirty, isSaving, ...query },
    randomGroups: { cardIds, cards, onSelect, selection, relate, nextSet, deselectAll, cycles },
    showIds,
    cardSize,
  } = useImagesRelationshipsContext();

  const cardRef = useRef<HTMLDivElement>(null);
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const [cardQuantity, cardWidth] = useMemo(() => {
    const cq = Math.floor(containerWidth / cardSize) + 1;
    const cw = Math.floor(containerWidth / cq);
    return [cq, cw];
  }, [cardSize, containerWidth]);

  const onNextSet = () => {
    nextSet();
    cardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DataLoadingWrapper
      error={query.error}
      hasResponseData={!isEmpty(query.data)}
      isLoading={query.isLoading}
    >
      <div className="my-6" ref={ref}>
        <Card
          className="image-card-categorizer-card"
          extra={
            <Tooltip title="Total cycles">
              <FileImageOutlined /> {cycles}
            </Tooltip>
          }
          ref={cardRef}
          title="Card Relationship Matching"
        >
          <Image.PreviewGroup>
            <div
              className="image-cards-group"
              style={{ gridTemplateColumns: `repeat(${Math.max(cardQuantity, 1)}, 1fr)` }}
            >
              {cardIds.map((cardId: string, index: number) => {
                const isSelected = selection.includes(cardId);
                const card = cards[index];

                return (
                  <div className="image-card-card__image" key={cardId}>
                    <TransparentButton
                      active={isSelected}
                      activeClass="image-cards-group__button--active"
                      className="image-cards-group__button"
                      onClick={() => onSelect(cardId)}
                    >
                      <ImageCard id={cardId} preview={false} width={cardWidth - 24} />
                      <div>
                        {showIds && <IdTag>{cardId}</IdTag>}
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
            deselectAll={deselectAll}
            isDirty={isDirty}
            isSaving={isSaving}
            onNextSet={onNextSet}
            relate={relate}
            selection={selection}
          />
        </Card>
      </div>
    </DataLoadingWrapper>
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
    return <FloatButton icon={<LoadingOutlined />} />;
  }

  const onRelate = () => {
    if (selection.length < 2) return;
    relate();
  };

  return (
    <>
      {isDirty && (
        <FloatButton icon={<WarningOutlined />} style={{ right: 24 + 70 + 70 + 70 }} type="primary" />
      )}
      <FloatButton
        icon={<ExpandOutlined />}
        onClick={deselectAll}
        // tooltip="Deselect"
        style={{ right: 24 + 70 + 70 }}
      />
      <FloatButton
        badge={{ count: selection.length, size: 'small' }}
        icon={<ForkOutlined />}
        onClick={onRelate}
        // tooltip="Relate"
        style={{ right: 24 + 70 }}
        type={selection.length < 2 ? 'default' : 'primary'}
      />
      <FloatButton
        icon={<SyncOutlined />}
        onClick={onNextSet}
        // tooltip="Next Set"
        style={{ right: 24 }}
      />
    </>
  );
};
