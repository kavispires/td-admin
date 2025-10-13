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
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { ImageCardDescriptor } from 'types';
import { removeDuplicates } from 'utils';
import { ImageCard } from '../ImageCard';

const DEFAULT_CARD_SIZE = 200;

export function ImageCardsDescriptorModal({
  data,
  addEntryToUpdate,
  onClose,
  onNewCard,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptor> & {
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
      actions={[
        <Button className="my-10" key="cancel" onClick={onClose}>
          Close
        </Button>,
        <Button className="my-10" key="cancel" onClick={onNewCard}>
          New Card
        </Button>,
      ]}
      cover={
        <Flex align="center" justify="center" style={{ width: '100vw' }}>
          <ImageCard cardId={cardId ?? ''} width={cardSize} />
        </Flex>
      }
      onClose={() => removeParam('cardId')}
      open={!!cardId}
      title={`Image Card Descriptor for ${cardId}`}
    >
      <Flex gap={8} key={cardId} style={{ maxWidth: '500px' }} vertical>
        <Slider
          max={500}
          min={100}
          onChange={(v) => addParam('cardSize', v, DEFAULT_CARD_SIZE)}
          step={25}
          style={{ maxWidth: 500, width: '100%' }}
          value={cardSize}
        />
        <FavoriteImageCardButton addEntryToUpdate={addEntryToUpdate} imageCard={imageCard} size="large" />
        <ImageCardKeywordsField addEntryToUpdate={addEntryToUpdate} imageCard={imageCard} size="large" />
        <ImageCardTriggersField addEntryToUpdate={addEntryToUpdate} imageCard={imageCard} size="large" />
      </Flex>
    </FullScreenModal>
  );
}

type FavoriteImageCardButtonProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
} & Omit<ButtonProps, 'onClick' | 'icon' | 'shape'>;

export function FavoriteImageCardButton({
  imageCard,
  addEntryToUpdate,
  ...buttonProps
}: FavoriteImageCardButtonProps) {
  const isHearted = imageCard.favorite;
  return (
    <Button
      icon={isHearted ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
      onClick={() => addEntryToUpdate(imageCard.id, { ...imageCard, favorite: !isHearted })}
      shape="circle"
      type="text"
      {...buttonProps}
    />
  );
}

type ImageCardKeywordsFieldProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
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
      enterButton="Update"
      onSearch={(v) => onUpdateKeywords(v)}
      style={{ maxWidth: 500, width: '100%', ...style }}
      {...inputProps}
    />
  );
}

type ImageCardTriggersFieldProps = {
  imageCard: ImageCardDescriptor;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptor>['addEntryToUpdate'];
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
      allowClear
      defaultValue={imageCard?.triggers}
      mode="multiple"
      onChange={onUpdateTriggers}
      options={[
        { label: 'aliens', value: 'aliens' },
        { label: 'insets', value: 'insets' },
        { label: 'snakes', value: 'snakes' },
        { label: 'spiders', value: 'spiders' },
        { label: 'scarry', value: 'scarry' },
      ]}
      placeholder="Please select"
      style={{ width: '100%', ...style }}
      {...selectProps}
    />
  );
}
