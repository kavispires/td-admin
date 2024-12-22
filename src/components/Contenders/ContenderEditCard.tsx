import { EditOutlined } from '@ant-design/icons';
import { Card, Flex, Popover, Radio, Select } from 'antd';
import { DualLanguageTextField, Label, NSFWField } from 'components/Common/EditableFields';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { ImageCard } from 'components/Images/ImageCard';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { merge } from 'lodash';
import { ContenderCard } from 'types';
import { removeDuplicates } from 'utils';
import { PLACEHOLDER_DUAL_LANGUAGE_OBJECT } from 'utils/constants';

export const DECKS = [
  { value: 'base', label: 'Base' },
  { value: 'anime', label: 'Anime' },
  { value: 'art', label: 'Art' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'characters', label: 'Characters' },
  { value: 'comics', label: 'Comics' },
  { value: 'games', label: 'Games' },
  { value: 'history', label: 'History' },
  { value: 'internet', label: 'Internet' },
  { value: 'literature', label: 'Literature' },
  { value: 'movies', label: 'Movies' },
  { value: 'music', label: 'Music' },
  { value: 'mythology', label: 'Mythology' },
  { value: 'pop-culture', label: 'Pop Culture' },
  { value: 'random', label: 'Random' },
  { value: 'sports', label: 'Sports' },
  { value: 'television', label: 'Television' },
  { value: 'special-td', label: 'Special TD' },
  { value: 'special-td-bg', label: 'Special TD BG' },
];

const checkInvalidDecks = (decks?: string[], exclusivity?: string) => {
  if (!decks || decks.length === 0) return 'warning';

  const isInvalid = decks.filter((deck) => !DECKS.some((d) => d.value === deck));
  if (isInvalid.length > 0) return 'error';

  if (exclusivity && decks.includes('base')) return 'error';

  return undefined;
};

type ContenderEditCardProps = {
  contender: ContenderCard;
  addEntryToUpdate: ReturnType<typeof useResourceFirebaseData<ContenderCard>>['addEntryToUpdate'];
};

export function ContenderEditCard({ contender, addEntryToUpdate }: ContenderEditCardProps) {
  const onUpdateDualText = (value: string, field: keyof ContenderCard, language: 'en' | 'pt') => {
    addEntryToUpdate(
      contender.id,
      merge({ [field]: { en: '', pt: '' } }, contender, { [field]: { [language]: value } }),
    );
  };

  const onUpdateNSFW = (value: boolean) => {
    addEntryToUpdate(contender.id, merge(contender, { nsfw: value }));
  };

  const onUpdateDecks = (value: string[]) => {
    addEntryToUpdate(contender.id, { ...contender, decks: removeDuplicates(value).sort() });
  };

  return (
    <Card
      hoverable
      style-={{ width: 240, maxWidth: 240 }}
      cover={<ImageCard id={contender.id} width={240} />}
    >
      <Card.Meta
        // avatar={getGenderIcon(contender)}
        title={contender.id}
        description={
          <Flex vertical>
            <Label>Name</Label>
            <DualLanguageTextField
              value={contender.name}
              language="en"
              onChange={(e) => onUpdateDualText(e.target.value, 'name', 'en')}
            />
            <DualLanguageTextField
              value={contender.name}
              language="pt"
              onChange={(e) => onUpdateDualText(e.target.value, 'name', 'pt')}
            />
            <Label>Description</Label>
            <DualLanguageTextField
              value={contender.description ?? PLACEHOLDER_DUAL_LANGUAGE_OBJECT}
              language="en"
              onChange={(e) => onUpdateDualText(e.target.value, 'description', 'en')}
            />
            <DualLanguageTextField
              value={contender.description ?? PLACEHOLDER_DUAL_LANGUAGE_OBJECT}
              language="pt"
              onChange={(e) => onUpdateDualText(e.target.value, 'description', 'pt')}
            />
            <Label>Decks</Label>
            <Select
              mode="multiple"
              defaultValue={contender.decks ?? []}
              size="small"
              options={DECKS}
              onChange={(e) => onUpdateDecks(e)}
              style={{ maxWidth: `calc(100vw / 9)` }}
              status={checkInvalidDecks(contender.decks, contender.exclusivity)}
            />
            <Flex align="center">
              <Label>NSFW</Label>{' '}
              <NSFWField value={contender.nsfw} size="small" onChange={(e) => onUpdateNSFW(e)} />
            </Flex>
            <Flex align="center" gap={8}>
              <Label>Exclusivity</Label>{' '}
              <Exclusivity contender={contender} addEntryToUpdate={addEntryToUpdate} />
            </Flex>
          </Flex>
        }
      />
      <Card.Meta />
    </Card>
  );
}

function Exclusivity({ contender, addEntryToUpdate }: ContenderEditCardProps) {
  const onUpdateExclusivity = (language?: string) => {
    addEntryToUpdate(contender.id, merge(contender, { exclusivity: language }));
  };

  const options = [
    { value: 'en', label: <LanguageFlag language="en" style={{ width: 24 }} /> },
    { value: 'pt', label: <LanguageFlag language="pt" style={{ width: 24 }} /> },
    { value: 'none', label: 'None' },
  ];

  const content = (
    <Flex gap={8}>
      <Radio.Group
        options={options}
        onChange={(e) => onUpdateExclusivity(e.target.value)}
        value={contender?.exclusivity}
      />
    </Flex>
  );

  return (
    <Flex gap={8}>
      {contender?.exclusivity === 'en' && <LanguageFlag language="en" style={{ width: 24 }} />}
      {contender?.exclusivity === 'pt' && <LanguageFlag language="pt" style={{ width: 24 }} />}
      {!contender?.exclusivity && <>None</>}
      <Popover title="Change exclusivity?" content={content} trigger="click">
        <EditOutlined />
      </Popover>
    </Flex>
  );
}
