import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import {
  Button,
  type ButtonProps,
  Flex,
  Input,
  type InputProps,
  Select,
  type SelectProps,
  Slider,
} from 'antd';
import { FullScreenModal } from 'components/Common/FullScreenModal';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { ImageCardDescriptor } from 'types';
import { removeDuplicates } from 'utils';
import { ImageCard } from '../ImageCard';

const DEFAULT_CARD_SIZE = 200;

export function ImageCardsDescriptorModal({
  data,
  addEntryToUpdate,
  onClose,
  onNewCard,
}: UseResourceFirebaseDataReturnType<ImageCardDescriptor> & {
  onNewCard: () => void;
  onClose: () => void;
}) {
  const { queryParams, removeParam, addParam } = useQueryParams();
  const cardSize = Number(queryParams.get('cardSize') ?? DEFAULT_CARD_SIZE);

  const cardId = queryParams.get('cardId');
  const imageCard = data[cardId ?? ''] ?? {
    id: cardId,
    keywords: [],
  };

  return (
    <FullScreenModal
      title={`Image Card Descriptor for ${cardId}`}
      open={!!cardId}
      onClose={() => removeParam('cardId')}
      cover={
        <Flex justify="center" align="center" style={{ width: '100vw' }}>
          <ImageCard id={cardId ?? ''} width={cardSize} />
        </Flex>
      }
      actions={[
        <Button key="cancel" className="my-10" onClick={onClose}>
          Close
        </Button>,
        <Button key="cancel" className="my-10" onClick={onNewCard}>
          New Card
        </Button>,
      ]}
    >
      <Flex gap={8} vertical key={cardId} style={{ maxWidth: '500px' }}>
        <Slider
          value={cardSize}
          min={100}
          max={500}
          step={25}
          style={{ maxWidth: 500, width: '100%' }}
          onChange={(v) => addParam('cardSize', v, DEFAULT_CARD_SIZE)}
        />
        <FavoriteImageCardButton imageCard={imageCard} addEntryToUpdate={addEntryToUpdate} size="large" />
        <ImageCardKeywordsField imageCard={imageCard} addEntryToUpdate={addEntryToUpdate} size="large" />
        <ImageCardTriggersField imageCard={imageCard} addEntryToUpdate={addEntryToUpdate} size="large" />
      </Flex>
    </FullScreenModal>
  );
}

type FavoriteImageCardButtonProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
} & Omit<ButtonProps, 'onClick' | 'icon' | 'shape'>;

export function FavoriteImageCardButton({
  imageCard,
  addEntryToUpdate,
  ...buttonProps
}: FavoriteImageCardButtonProps) {
  const isHearted = imageCard.favorite;
  return (
    <Button
      shape="circle"
      icon={isHearted ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
      type="text"
      onClick={() => addEntryToUpdate(imageCard.id, { ...imageCard, favorite: !isHearted })}
      {...buttonProps}
    />
  );
}

type ImageCardKeywordsFieldProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
} & Omit<InputProps, 'onSearch' | 'icon' | 'shape'>;

export function ImageCardKeywordsField({
  imageCard,
  addEntryToUpdate,
  style,
  ...inputProps
}: ImageCardKeywordsFieldProps) {
  const onUpdateKeywords = (keywords: string) => {
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      keywords: removeDuplicates(
        keywords
          .toLocaleLowerCase()
          .split(/, |,| /)
          .filter(Boolean)
          .map((v) => v.trim())
          .sort(),
      ),
    });
  };

  return (
    <Input.Search
      defaultValue={imageCard.keywords.join(' ')}
      onSearch={(v) => onUpdateKeywords(v)}
      style={{ maxWidth: 500, width: '100%', ...style }}
      enterButton="Update"
      {...inputProps}
    />
  );
}

type ImageCardTriggersFieldProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
} & Omit<SelectProps, 'onClick' | 'icon' | 'shape'>;

export function ImageCardTriggersField({
  imageCard,
  addEntryToUpdate,
  style,
  ...selectProps
}: ImageCardTriggersFieldProps) {
  const onUpdateTriggers = (triggers: string[]) => {
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      triggers,
    });
  };

  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%', ...style }}
      placeholder="Please select"
      defaultValue={imageCard?.triggers}
      onChange={onUpdateTriggers}
      options={[
        { label: 'aliens', value: 'aliens' },
        { label: 'insets', value: 'insets' },
        { label: 'snakes', value: 'snakes' },
        { label: 'spiders', value: 'spiders' },
        { label: 'scarry', value: 'scarry' },
      ]}
      {...selectProps}
    />
  );
}
