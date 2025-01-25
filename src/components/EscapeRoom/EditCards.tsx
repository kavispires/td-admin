import { Form, Input, Button, Select, Switch, Drawer, Flex, InputNumber, Divider } from 'antd';
import { useMemo } from 'react';
import {
  CARD_TYPES,
  type EscapeRoomEpisode,
  type ERMissionCard,
  type EscapeRoomCardType,
  type ERTextCard,
  type ERItemCard,
  type ERItemCollectionCard,
} from './types';
import { useQueryParams } from 'hooks/useQueryParams';
import { generateCard } from './utils';
import type { EscapeRoomResourceContextType } from './EscapeRoomFilters';
import { useOutletContext } from 'react-router-dom';
import { capitalize, cloneDeep } from 'lodash';
import { CloseOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons';

/**
 * A read-only form entry component for displaying the ID of the card.
 * @param props.id - The ID of the escape room card.
 */
function FormDefaultEntryCardId({ id }: Pick<EscapeRoomCardType, 'id'>) {
  return (
    <Form.Item label="Card ID" name="id">
      <Input readOnly value={id} />
    </Form.Item>
  );
}

/**
 * A read-only form entry component for displaying the type of the card.
 * @param props.type - The type of the escape room card.
 */
function FormDefaultEntryCardType() {
  return (
    <Form.Item label="Card Type" name="type">
      <Input readOnly />
    </Form.Item>
  );
}

/**
 * A form entry component for changing the variant of the card.
 * @param props.variant - The variant of the escape room card.
 */
function FormDefaultEntryCardVariant() {
  return (
    <Form.Item label="Variant" name="variant">
      <Select style={{ width: 120 }}>
        <Select.Option value="default">Default</Select.Option>
      </Select>
    </Form.Item>
  );
}

/**
 * A form entry component for toggling the unplayable flag.
 * @param props.unplayable - The unplayable flag of the escape room card.
 */
function FormDefaultEntryUnplayable({ unplayable }: Pick<EscapeRoomCardType, 'unplayable'>) {
  return (
    <Form.Item label="Unplayable" name="unplayable">
      <Switch defaultChecked={unplayable} />
    </Form.Item>
  );
}

/**
 * A form entry component for toggling the filler flag.
 * @param props.filler - The filler flag of the escape room card.
 */
function FormDefaultEntryFiller({ filler }: Pick<EscapeRoomCardType, 'filler'>) {
  return (
    <Form.Item label="Filler" name="filler">
      <Switch defaultChecked={filler} />
    </Form.Item>
  );
}

function FormEntryText({ path }: { path: string[] }) {
  return (
    <Flex vertical>
      <Form.Item label={capitalize(path[path.length - 1])} name={path}>
        <Input />
      </Form.Item>
    </Flex>
  );
}

function FormEntryList({ path }: { path: string[] }) {
  return (
    <>
      <span>{capitalize(path[path.length - 1])}</span>
      <Form.List name={path}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Flex key={key} align="center">
                <Form.Item
                  className="my-2"
                  {...restField}
                  name={name}
                  rules={[{ required: true, message: 'Field is required' }]}
                >
                  <Input placeholder="Enter value" />
                </Form.Item>
                <Button type="link" danger onClick={() => remove(name)} icon={<CloseOutlined />} />
              </Flex>
            ))}
            <Form.Item>
              <Button onClick={() => add()} icon={<PlusOutlined />} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}

type AddCardDrawerProps = {
  updateCard: (card: EscapeRoomCardType) => void;
};
export function AddCardDrawer({ updateCard }: AddCardDrawerProps) {
  const { queryParams, removeParam } = useQueryParams();
  const open = queryParams.has('addCard');
  return (
    <Drawer open={open} onClose={() => removeParam('addCard')}>
      {open && <AddCardDrawerContent updateCard={updateCard} />}
    </Drawer>
  );
}

function AddCardDrawerContent({ updateCard }: AddCardDrawerProps) {
  const { queryParams } = useQueryParams();
  const cardType = queryParams.get('addCard') || 'mission';
  const card = useMemo(() => generateCard(cardType as EscapeRoomCardType['type']), [cardType]);

  return <EditCardForm card={card} updateCard={updateCard} />;
}

type EditCardDrawerProps = {
  updateCard: (card: EscapeRoomCardType) => void;
  episode: EscapeRoomEpisode;
};
export function EditCardDrawer({ episode, updateCard }: EditCardDrawerProps) {
  const { queryParams, removeParam } = useQueryParams();
  const open = queryParams.has('editCard');
  const cardId = queryParams.get('editCard') || '';
  const card = episode.cards?.[cardId];
  return (
    <Drawer open={open} onClose={() => removeParam('editCard')}>
      {open && card && <EditCardForm card={card} updateCard={updateCard} />}
    </Drawer>
  );
}

type EditCardFormProps = {
  card: EscapeRoomCardType;
  updateCard: (card: EscapeRoomCardType) => void;
};

function EditCardForm({ card, updateCard }: EditCardFormProps) {
  const [form] = Form.useForm();
  const { removeParam } = useQueryParams();

  const handleSubmit = (values: Partial<EscapeRoomCardType>) => {
    const processedCard = cloneDeep(card);
    if (values.filler) processedCard.filler = values.filler;
    if (values.variant) processedCard.variant = values.variant;
    if (values.unplayable) processedCard.unplayable = values.unplayable;

    console.log(values);
    switch (values.type) {
      case CARD_TYPES.MISSION: {
        const newFields = values as ERMissionCard;
        processedCard.content = {
          number: newFields.content.number ?? 0,
          title: newFields.content.title,
          paragraphs: newFields.content.paragraphs,
          subtitle: newFields.content.subtitle,
        };
        break;
      }
      case CARD_TYPES.TEXT: {
        const newFields = values as ERTextCard;
        processedCard.content = {
          text: newFields.content.text,
          spriteId: newFields.content.spriteId,
        };
        break;
      }
      case CARD_TYPES.ITEM: {
        const newFields = values as ERItemCard;
        processedCard.content = {
          itemId: newFields.content.itemId,
          name: newFields.content.name,
        };
        break;
      }
      case CARD_TYPES.ITEM_COLLECTION: {
        const newFields = values as ERItemCollectionCard;
        processedCard.content = {
          itemsIds: newFields.content.itemsIds,
          pattern: newFields.content.pattern,
          backgroundColor: newFields.content.backgroundColor,
        };
        break;
      }
      // case CARD_TYPES.IMAGE_CLUE:
      //   processedCard = {
      //     ...card,
      //     ...values,
      //     content: {
      //       imageId: values.imageId ?? '',
      //       description: values.description ?? { en: '', pt: '' },
      //     },
      //   } as ERImageClueCard;
      // break;

      // Add other cases for different card types
      default:
        console.error(`Unsupported card type: ${card.type}`);
        return;
    }

    console.log('Processed Card:', processedCard);
    updateCard(processedCard);
    removeParam('addCard');
    removeParam('editCard');
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={card}>
      <Flex gap={8}>
        <FormDefaultEntryCardId id={card.id} />
        <FormDefaultEntryCardType />
      </Flex>
      <Flex gap={8}>
        <FormDefaultEntryCardVariant />
        <FormDefaultEntryUnplayable />
        <FormDefaultEntryFiller />
      </Flex>

      <Divider className="my-4" />
      {card.type === CARD_TYPES.MISSION && <MissionFields />}
      {card.type === CARD_TYPES.TEXT && <TextFields />}
      {card.type === CARD_TYPES.ITEM && <ItemFields />}
      {card.type === CARD_TYPES.ITEM_COLLECTION && <ItemCollectionFields />}
      <Divider className="my-4" />
      <Flex gap={8}>
        <Button type="primary" htmlType="submit" block>
          Add Card
        </Button>
        <Button
          onClick={() => {
            removeParam('addCard');
            removeParam('editCard');
          }}
        >
          Cancel
        </Button>
      </Flex>
    </Form>
  );
}

export function MissionFields() {
  return (
    <>
      <Form.Item label="Mission Number" name={['content', 'number']}>
        <InputNumber min={0} max={10} />
      </Form.Item>

      <FormEntryText path={['content', 'title']} />
      <FormEntryText path={['content', 'subtitle']} />
      <FormEntryList path={['content', 'paragraphs']} />
    </>
  );
}

export function TextFields() {
  return (
    <>
      <FormEntryText path={['content', 'text']} />
      <FormEntryText path={['content', 'spriteId']} />
    </>
  );
}

export function ItemFields() {
  return (
    <>
      <FormEntryText path={['content', 'itemId']} />
      <FormEntryText path={['content', 'name']} />
    </>
  );
}

export function ItemCollectionFields() {
  return (
    <>
      <FormEntryList path={['content', 'itemsIds']} />
      <FormEntryText path={['content', 'pattern']} />
      <FormEntryText path={['content', 'backgroundColor']} />
    </>
  );
}
