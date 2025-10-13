import { CheckCircleFilled, PlusOutlined } from '@ant-design/icons';
import { App, Button, Divider, Flex, Input, Space, Tag, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import { useMemo, useState } from 'react';
import type { ImageCardPasscodeSet } from 'types';
import { createUUID, removeDuplicates } from 'utils';
import { ImageCard } from '../ImageCard';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';
import { SetsTable, usePasscodeSetTypeahead } from './ImageCardsPasscodeComponents';

type ImageCardsPasscodeProps = UseResourceFirestoreDataReturnType<ImageCardPasscodeSet>;

const PLACEHOLDER: ImageCardPasscodeSet = {
  id: '',
  passcode: [],
  imageCardsIds: [],
};
const getInitialPlaceholders = (count: number, existingIds: string[]) =>
  Array.from({ length: count }, () => ({
    ...cloneDeep(PLACEHOLDER),
    id: createUUID(existingIds),
  }));

export function ImageCardsPasscodeCreate(query: ImageCardsPasscodeProps) {
  const [placeholderSets, setPlaceholderSets] = useState(getInitialPlaceholders(3, Object.keys(query.data)));

  const onAddRow = () => {
    setPlaceholderSets((prev) => [
      ...prev,
      {
        ...cloneDeep(PLACEHOLDER),
        id: crypto.randomUUID().substring(0, 5),
      },
    ]);
  };

  const updateEntry = (id: string, entry: ImageCardPasscodeSet) => {
    setPlaceholderSets((prev) => prev.map((e) => (e.id === id ? entry : e)));
  };

  const onAddEntriesToDatabase = () => {
    console.log('Add entries to database');
    placeholderSets.forEach((entry) => {
      if (entry.passcode.length > 0 && entry.imageCardsIds.length > 0) {
        query.addEntryToUpdate(entry.id, entry);
      }
    });
    setPlaceholderSets(getInitialPlaceholders(5, Object.keys(query.data)));
  };

  const isDirty = useMemo(() => {
    return placeholderSets.some((entry) => entry.passcode.length > 0 || entry.imageCardsIds.length > 0);
  }, [placeholderSets]);

  return (
    <Space className="full-width" direction="vertical">
      <Button disabled={!isDirty} onClick={onAddEntriesToDatabase} type="primary">
        Add Entries
      </Button>
      <SetsTable addEntryToUpdate={updateEntry} sets={placeholderSets} />

      <Button icon={<PlusOutlined />} onClick={onAddRow}>
        Add row
      </Button>
      <Divider />
      <ImageCardMultiCreate addEntryToUpdate={query.addEntryToUpdate} data={query.data} />
    </Space>
  );
}

type ImageCardMultiCreateProps = {
  data: Dictionary<ImageCardPasscodeSet>;
  addEntryToUpdate: (id: string, entry: ImageCardPasscodeSet) => void;
};

function ImageCardMultiCreate({ data, addEntryToUpdate }: ImageCardMultiCreateProps) {
  const [imageIdInput, setImageIdInput] = useState('');
  const [imageId, setImageId] = useState('');
  const { namesDict, imagesDict } = usePasscodeSetTypeahead(data);
  const { onRandomCard } = useImageCardsDecks();
  const [namesInput, setNamesInput] = useState('');
  const { message } = App.useApp();

  const onLoadImageCard = () => {
    if (!imageIdInput) return;
    setImageId(imageIdInput);
  };

  const onSetRandomCard = () => {
    const randomCardId = onRandomCard();
    setImageId(randomCardId);
    setImageIdInput(randomCardId);
  };

  const onProcessNewEntries = () => {
    const names = namesInput
      .split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    if (names.length > 0 && imageId) {
      names.forEach((name) => {
        if (namesDict[name]) {
          const existingEntry = data[namesDict[name]];
          existingEntry.imageCardsIds.push(imageId);
          existingEntry.imageCardsIds = removeDuplicates(existingEntry.imageCardsIds);
          addEntryToUpdate(existingEntry.id, existingEntry);
        } else {
          const newEntry: ImageCardPasscodeSet = {
            id: createUUID(Object.keys(data)),
            passcode: [name],
            imageCardsIds: [imageId],
          };
          addEntryToUpdate(newEntry.id, newEntry);
        }
      });
    }

    setNamesInput('');
    onSetRandomCard();
    message.success('Entries processed');
  };

  return (
    <>
      <Typography.Title className="my-0" level={4}>
        Create Image Card Multiprompt
      </Typography.Title>
      <Space className="full-width">
        <Flex gap={8} vertical>
          <Flex>
            <Input
              onChange={(e) => setImageIdInput(e.target.value)}
              onPressEnter={onLoadImageCard}
              placeholder="Image Card ID"
              value={imageIdInput}
            />
            <Button onClick={onSetRandomCard}>Random</Button>
          </Flex>
          <ImageCard cardId={imageId} cardWidth={200} />
        </Flex>
        <Flex gap={8} vertical>
          <Flex>
            <Input onChange={(e) => setNamesInput(e.target.value)} placeholder="Names" value={namesInput} />
            <Button disabled={!imageId || !namesInput} onClick={onProcessNewEntries} type="primary">
              Process
            </Button>
          </Flex>
          <Flex gap={8} wrap>
            {namesInput.split(',').map((name) => {
              const trimmedName = name.trim().toLowerCase();
              const exists = namesDict[trimmedName];
              return (
                <Tag
                  color={exists ? 'blue' : 'green'}
                  icon={exists ? <CheckCircleFilled /> : <PlusOutlined />}
                  key={trimmedName}
                >
                  {trimmedName}
                </Tag>
              );
            })}
          </Flex>
          <Flex gap={8} wrap>
            {imagesDict[imageId] && (
              <>
                <Typography.Text type="secondary">Already in:</Typography.Text>
                {imagesDict[imageId]?.map((name) => (
                  <Tag key={name}>{name}</Tag>
                ))}
              </>
            )}
          </Flex>
        </Flex>
      </Space>
    </>
  );
}
