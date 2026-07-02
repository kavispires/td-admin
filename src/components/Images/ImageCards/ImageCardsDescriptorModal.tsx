import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { DualLanguageTextField } from '@components/Common/EditableFields';
import { FullScreenModal } from '@components/Common/FullScreenModal';
import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import { useTDResource } from '@hooks/useTDResource';
import type { ImageCardDescriptorData } from '@types';
import { removeDuplicates } from '@utils/array';
import { Button, type ButtonProps, Flex, Input, Select, type SelectProps, Slider } from 'antd';
import { ImageCard } from '../ImageCard';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';

const DEFAULT_CARD_SIZE = 200;

export function ImageCardsDescriptorModal({
  data,
  addEntryToUpdate,
}: Pick<UseResourceFirestoreDataReturnType<ImageCardDescriptorData>, 'data' | 'addEntryToUpdate'>) {
  const { queryParams, removeParam, addParam } = useQueryParams();
  const cardId = queryParams.get('cardId') || '';
  const imageCardsDecksQuery = useImageCardsDecks({ enabled: !!cardId });
  const tdrImagesCredoQuery = useTDResource('images-credo', { enabled: !!cardId });
  const cardSize = Number(queryParams.get('cardSize') ?? DEFAULT_CARD_SIZE);

  const imageCard = data[cardId ?? ''] ?? {
    id: cardId,
    title: { en: '', pt: '' },
    description: { en: '', pt: '' },
    keywords: { en: '', pt: '' },
  };

  const onClose = () => removeParam('cardId');

  const onNewCard = () => addParam('cardId', imageCardsDecksQuery.onRandomCard());

  if (!cardId) return null;
  if (!imageCardsDecksQuery.isSuccess || !tdrImagesCredoQuery.isSuccess) return null;

  return (
    <FullScreenModal
      actions={[
        <Button
          className="my-10"
          key="cancel"
          onClick={onClose}
        >
          Close
        </Button>,
        <Button
          className="my-10"
          key="new"
          onClick={onNewCard}
        >
          New Card
        </Button>,
      ]}
      cover={
        <Flex
          align="center"
          justify="center"
          style={{ width: '100vw' }}
        >
          <ImageCard
            cardId={cardId ?? ''}
            cardWidth={cardSize}
          />
        </Flex>
      }
      onClose={() => removeParam('cardId')}
      open={!!cardId}
      title={`Image Card Descriptor for ${cardId}`}
    >
      <Flex
        gap={8}
        key={cardId}
        style={{ maxWidth: '500px' }}
        vertical
      >
        <Slider
          max={500}
          min={100}
          onChange={(v) => addParam('cardSize', v, DEFAULT_CARD_SIZE)}
          step={25}
          style={{ maxWidth: 500, width: '100%' }}
          value={cardSize}
        />
        <FavoriteImageCardButton
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
          size="large"
        />
        <ImageCardTitleField
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
        />
        <ImageCardDescriptionField
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
        />
        <ImageCardKeywordsField
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
        />
        <ImageCardTriggersField
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
          size="large"
        />
        <ImageCardAssociatedDreamsField
          addEntryToUpdate={addEntryToUpdate}
          imageCard={imageCard}
          size="large"
        />
      </Flex>
    </FullScreenModal>
  );
}

type FavoriteImageCardButtonProps = {
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
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
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
};

/**
 * Component to edit the keywords field of an image card (dual language)
 */
export function ImageCardKeywordsField({ imageCard, addEntryToUpdate }: ImageCardKeywordsFieldProps) {
  const onUpdateKeywords = (keywords: string, language: 'en' | 'pt') => {
    const keywordArray = keywords
      .toLocaleLowerCase()
      .split(/, |,| /)
      .filter(Boolean)
      .map((v) => v.trim())
      .sort();

    const processedKeywords = removeDuplicates(keywordArray).join(',');
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      keywords: {
        ...imageCard.keywords,
        [language]: processedKeywords,
      },
    });
  };

  return (
    <Flex
      gap={4}
      vertical
    >
      <Input.Search
        defaultValue={imageCard.keywords?.en}
        enterButton="Update EN"
        onSearch={(v) => onUpdateKeywords(v, 'en')}
        placeholder="Keywords (EN)"
        style={{ maxWidth: 500, width: '100%' }}
      />
      <Input.Search
        defaultValue={imageCard.keywords?.pt}
        enterButton="Update PT"
        onSearch={(v) => onUpdateKeywords(v, 'pt')}
        placeholder="Keywords (PT)"
        style={{ maxWidth: 500, width: '100%' }}
      />
    </Flex>
  );
}

type ImageCardTriggersFieldProps = {
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
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
      placeholder="Triggers"
      style={{ width: '100%', ...style }}
      {...selectProps}
    />
  );
}

type ImageCardTitleFieldProps = {
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
};

/**
 * Component to edit the title field of an image card (dual language)
 */
export function ImageCardTitleField({ imageCard, addEntryToUpdate }: ImageCardTitleFieldProps) {
  const onUpdateTitle = (value: string, language: 'en' | 'pt') => {
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      title: {
        ...imageCard.title,
        [language]: value,
      },
    });
  };

  return (
    <Flex
      gap={4}
      vertical
    >
      <DualLanguageTextField
        language="en"
        onBlur={(e) =>
          e.currentTarget?.value && e.currentTarget?.value.trim() !== imageCard.title?.en
            ? onUpdateTitle(e.currentTarget?.value.trim() || '', 'en')
            : undefined
        }
        onPressEnter={(e) => onUpdateTitle(e.currentTarget?.value?.trim() || '', 'en')}
        placeholder="Title"
        value={imageCard.title ?? { en: '', pt: '' }}
      />
      <DualLanguageTextField
        language="pt"
        onBlur={(e) =>
          e.currentTarget?.value && e.currentTarget?.value.trim() !== imageCard.title?.pt
            ? onUpdateTitle(e.currentTarget?.value.trim() || '', 'pt')
            : undefined
        }
        onPressEnter={(e) => onUpdateTitle(e.currentTarget?.value?.trim() || '', 'pt')}
        placeholder="Title"
        value={imageCard.title ?? { en: '', pt: '' }}
      />
    </Flex>
  );
}

type ImageCardDescriptionFieldProps = {
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
};

/**
 * Component to edit the description field of an image card (dual language)
 */
export function ImageCardDescriptionField({ imageCard, addEntryToUpdate }: ImageCardDescriptionFieldProps) {
  const onUpdateDescription = (value: string, language: 'en' | 'pt') => {
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      description: {
        ...imageCard.description,
        [language]: value,
      },
    });
  };

  return (
    <Flex
      gap={4}
      vertical
    >
      <DualLanguageTextField
        language="en"
        onBlur={(e) =>
          e.currentTarget?.value && e.currentTarget?.value.trim() !== imageCard.description?.en
            ? onUpdateDescription(e.currentTarget?.value.trim() || '', 'en')
            : undefined
        }
        onPressEnter={(e) => onUpdateDescription(e.currentTarget?.value?.trim() || '', 'en')}
        placeholder="Description (up to 50 words)"
        value={imageCard.description ?? { en: '', pt: '' }}
      />
      <DualLanguageTextField
        language="pt"
        onBlur={(e) =>
          e.currentTarget?.value && e.currentTarget?.value.trim() !== imageCard.description?.pt
            ? onUpdateDescription(e.currentTarget?.value.trim() || '', 'pt')
            : undefined
        }
        onPressEnter={(e) => onUpdateDescription(e.currentTarget?.value?.trim() || '', 'pt')}
        placeholder="Descrição (até 50 palavras)"
        value={imageCard.description ?? { en: '', pt: '' }}
      />
    </Flex>
  );
}

type ImageCardAssociatedDreamsFieldProps = {
  imageCard: ImageCardDescriptorData;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>['addEntryToUpdate'];
} & Omit<SelectProps, 'onClick' | 'icon' | 'shape'>;

/**
 * Component to edit the associatedDreams field (theme-words deck card ids)
 */
export function ImageCardAssociatedDreamsField({
  imageCard,
  addEntryToUpdate,
  style,
  ...selectProps
}: ImageCardAssociatedDreamsFieldProps) {
  const onUpdateAssociatedDreams = (associatedDreams: string[]) => {
    addEntryToUpdate(imageCard.id, {
      ...imageCard,
      associatedDreams,
    });
  };

  return (
    <Select
      allowClear
      defaultValue={imageCard?.associatedDreams}
      mode="tags"
      onChange={onUpdateAssociatedDreams}
      placeholder="Associated Dreams (theme-words IDs)"
      style={{ width: '100%', ...style }}
      {...selectProps}
    />
  );
}
