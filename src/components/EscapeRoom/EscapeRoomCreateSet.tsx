import { CopyOutlined, EditOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import {
  App,
  AutoComplete,
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { orderBy } from 'lodash';
import type { UseEscapeRoomResourceReturnType } from 'pages/EscapeRoom/useEscapeRoomResource';
import { useCallback, useMemo, useState } from 'react';
import { createUUID } from 'utils';
import { BACKGROUNDS } from './cards/CardBuildingBlocks';
import { EscapeRoomCard } from './cards/EscapeRoomCard';
import type {
  EscapeRoomAnnouncementType,
  EscapeRoomCardType,
  EscapeRoomImageCardType,
  EscapeRoomMissionCardType,
  EscapeRoomWordCardType,
} from './cards/escape-room-types';

const ID_PREFIXES = {
  ANNOUNCEMENT: 'er-ann-',
  MISSION: 'er-ms-',
  IMAGE: 'er-img-',
  WORD: 'er-wd-',
};

type CreateCardForm = {
  /** Card type */
  type: 'ANNOUNCEMENT' | 'MISSION' | 'IMAGE' | 'WORD';
  /** Card ID */
  id: string;
  /** Card description */
  doc: string;
  /** Background */
  background: string;
  /** Whether the card is unplayable */
  unplayable: boolean;

  // Announcement fields
  /** Announcement title */
  announcementTitle?: string;
  /** Announcement subtitle */
  announcementSubtitle?: string;

  // Mission fields
  /** Mission number */
  missionNumber?: number;
  /** Mission title */
  missionTitle?: string;
  /** Mission paragraphs (markdown) */
  missionParagraphs?: string;
  /** Mission action (markdown) */
  missionAction?: string;

  // Image fields (Image cards don't have content, just the card itself)

  // Word fields
  /** Word to display */
  word?: string;
  /** Position of the word on the card */
  wordPosition?: number;
  /** Text alignment */
  wordAlign?: 'left' | 'center' | 'right';
  /** Text size */
  wordSize?: 'small' | 'medium' | 'large';
  /** Text color */
  wordColor?: string;
  /** Border color */
  wordBorderColor?: string;
  /** Border width */
  wordBorderWidth?: number;
};

const DEFAULT_FORM: CreateCardForm = {
  type: 'ANNOUNCEMENT',
  id: '',
  doc: '',
  background: 'default',
  unplayable: false,
  announcementTitle: '',
  announcementSubtitle: '',
  missionNumber: 1,
  missionTitle: '',
  missionParagraphs: '',
  missionAction: '',
  word: '',
  wordPosition: 1,
  wordAlign: 'center',
  wordSize: 'medium',
  wordColor: '',
  wordBorderColor: '',
  wordBorderWidth: 0,
}; /**
 * Create Set component for creating new Escape Room sets
 */
export function EscapeRoomCreateSet(query: UseEscapeRoomResourceReturnType) {
  const { addCardToUpdate, cards } = query;
  const { message } = App.useApp();

  const [form] = Form.useForm<CreateCardForm>();
  const [previewCard, setPreviewCard] = useState<EscapeRoomCardType | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Watch form values for preview
  const formValues = Form.useWatch([], form);

  const idSuffixes = useMemo(() => {
    return Object.keys(cards).map((id) => id.split('-').pop() || '');
  }, [cards]);

  /**
   * Generate a new unique card ID based on card type
   */
  const generateNewCardId = useCallback(
    (cardType: 'ANNOUNCEMENT' | 'MISSION' | 'IMAGE' | 'WORD') => {
      return `${ID_PREFIXES[cardType]}${createUUID(idSuffixes, 3)}`;
    },
    [idSuffixes],
  );

  /**
   * Regenerate the card ID
   */
  const onRegenerateId = useCallback(() => {
    const currentType = form.getFieldValue('type') || 'ANNOUNCEMENT';
    const newId = generateNewCardId(currentType);
    form.setFieldValue('id', newId);
    message.success(`New ID generated: ${newId}`);
  }, [form, generateNewCardId, message]);

  // Create options list for card selector
  const cardOptions = useMemo(() => {
    return orderBy(Object.values(cards), ['updatedAt', 'type'], ['desc', 'asc']).map((card) => ({
      label: `${card.id} (${card.doc})`,
      value: card.id,
    }));
  }, [cards]);

  /**
   * Convert an existing card to form values for duplication
   */
  const convertCardToForm = useCallback((card: EscapeRoomCardType): CreateCardForm => {
    const baseForm: CreateCardForm = {
      type: card.type.toUpperCase() as 'ANNOUNCEMENT' | 'MISSION' | 'IMAGE' | 'WORD',
      id: card.id,
      doc: card.doc,
      background: card.background,
      unplayable: card.unplayable ?? false,
    };

    switch (card.type) {
      case 'announcement': {
        const announcementCard = card as EscapeRoomAnnouncementType;
        return {
          ...baseForm,
          announcementTitle: announcementCard.content?.title?.value || '',
          announcementSubtitle: announcementCard.content?.subtitle?.value || '',
        };
      }

      case 'mission': {
        const missionCard = card as EscapeRoomMissionCardType;
        return {
          ...baseForm,
          missionNumber: missionCard.number,
          missionTitle: missionCard.content?.title?.value || '',
          missionParagraphs: missionCard.content?.paragraphs?.value || '',
          missionAction: missionCard.content?.action?.value || '',
        };
      }

      case 'word': {
        const wordCard = card as EscapeRoomWordCardType;
        return {
          ...baseForm,
          word: wordCard.content.word,
          wordPosition: wordCard.content.position,
          wordAlign: wordCard.content.align,
          wordSize: wordCard.content.size,
          wordColor: wordCard.content.color,
          wordBorderColor: wordCard.content.borderColor,
          wordBorderWidth: wordCard.content.borderWidth,
        };
      }

      case 'image':
        return baseForm;

      default:
        return baseForm;
    }
  }, []);

  /**
   * Handle duplicating a card
   */
  const onDuplicateCard = useCallback(() => {
    if (!selectedCardId) {
      message.warning('Please select a card first');
      return;
    }

    const card = cards[selectedCardId];
    if (!card) {
      message.error('Card not found');
      return;
    }

    const formValues = convertCardToForm(card);

    // Generate a new ID for the duplicated card
    const newId = generateNewCardId(formValues.type);

    // Set all form values
    form.setFieldsValue({
      ...formValues,
      id: newId,
    });

    setIsEditMode(false); // Duplicating creates a new card, not editing
    message.success(`Card ${selectedCardId} duplicated! New ID: ${newId}`);
    setSelectedCardId(null); // Clear selection after action
  }, [selectedCardId, cards, convertCardToForm, form, generateNewCardId, message]);

  /**
   * Handle editing an existing card
   */
  const onEditCard = useCallback(() => {
    if (!selectedCardId) {
      message.warning('Please select a card first');
      return;
    }

    const card = cards[selectedCardId];
    if (!card) {
      message.error('Card not found');
      return;
    }

    const formValues = convertCardToForm(card);

    // Set all form values, keeping the same ID
    form.setFieldsValue(formValues);

    setIsEditMode(true); // Enable edit mode to lock the ID
    message.info(`Editing card ${selectedCardId}. Make your changes and click Save.`);
    setSelectedCardId(null); // Clear selection after action
  }, [selectedCardId, cards, convertCardToForm, form, message]);

  /**
   * Convert form data to proper card format for preview
   */
  const convertFormToCard = useCallback((values: CreateCardForm): EscapeRoomCardType => {
    switch (values.type) {
      case 'ANNOUNCEMENT':
        return {
          id: values.id,
          type: 'announcement',
          doc: values.doc,
          background: values.background || 'default',
          unplayable: values.unplayable,
          updatedAt: Date.now(),
          content: {
            title: values.announcementTitle
              ? {
                  value: values.announcementTitle,
                  position: 1,
                  align: 'center',
                  size: 'medium',
                }
              : undefined,
            subtitle: values.announcementSubtitle
              ? {
                  value: values.announcementSubtitle,
                  position: 2,
                  align: 'center',
                  size: 'small',
                }
              : undefined,
          },
        } as EscapeRoomAnnouncementType;

      case 'MISSION':
        return {
          id: values.id,
          type: 'mission',
          doc: values.doc,
          background: values.background || 'mission',
          unplayable: values.unplayable,
          updatedAt: Date.now(),
          number: values.missionNumber || 1,
          content: {
            title: {
              value: values.missionTitle || '',
            },
            paragraphs: {
              value: values.missionParagraphs || '',
            },
            action: {
              value: values.missionAction || '',
            },
          },
        } as EscapeRoomMissionCardType;

      case 'IMAGE':
        return {
          id: values.id,
          type: 'image',
          doc: values.doc,
          background: values.background || 'default',
          unplayable: values.unplayable,
          updatedAt: Date.now(),
          content: null as never,
        } as EscapeRoomImageCardType;

      case 'WORD':
        return {
          id: values.id,
          type: 'word',
          doc: values.doc,
          background: values.background || 'default',
          unplayable: values.unplayable,
          updatedAt: Date.now(),
          content: {
            word: values.word || '',
            position: values.wordPosition || 1,
            align: values.wordAlign,
            size: values.wordSize,
            color: values.wordColor,
            borderColor: values.wordBorderColor,
            borderWidth: values.wordBorderWidth,
          },
        } as EscapeRoomWordCardType;

      default:
        throw new Error('Invalid card type');
    }
  }, []);

  /**
   * Update preview when form changes
   */
  useMemo(() => {
    if (formValues?.id) {
      try {
        const card = convertFormToCard(formValues);
        setPreviewCard(card);
      } catch (error) {
        console.error('Error converting form to card:', error);
        setPreviewCard(null);
      }
    } else {
      setPreviewCard(null);
    }
  }, [formValues, convertFormToCard]);

  /**
   * Save the card based on selected type
   */
  const onSaveCard = async () => {
    try {
      const values = await form.validateFields();

      let card: EscapeRoomCardType;

      switch (values.type) {
        case 'ANNOUNCEMENT':
          card = {
            id: values.id,
            type: 'announcement',
            doc: values.doc,
            background: values.background,
            unplayable: values.unplayable,
            updatedAt: Date.now(),
            content: {
              title: values.announcementTitle
                ? {
                    value: values.announcementTitle,
                    position: 1,
                    align: 'center',
                    size: 'medium',
                  }
                : undefined,
              subtitle: values.announcementSubtitle
                ? {
                    value: values.announcementSubtitle,
                    position: 2,
                    align: 'center',
                    size: 'small',
                  }
                : undefined,
            },
          } as EscapeRoomAnnouncementType;
          break;

        case 'MISSION':
          card = {
            id: values.id,
            type: 'mission',
            doc: values.doc,
            background: values.background,
            unplayable: values.unplayable,
            updatedAt: Date.now(),
            number: values.missionNumber || 1,
            content: {
              title: {
                value: values.missionTitle || '',
              },
              paragraphs: {
                value: values.missionParagraphs || '',
              },
              action: {
                value: values.missionAction || '',
              },
            },
          } as EscapeRoomMissionCardType;
          break;

        case 'IMAGE':
          card = {
            id: values.id,
            type: 'image',
            doc: values.doc,
            background: values.background,
            unplayable: values.unplayable,
            updatedAt: Date.now(),
            content: null as never,
          } as EscapeRoomImageCardType;
          break;

        case 'WORD':
          card = {
            id: values.id,
            type: 'word',
            doc: values.doc,
            background: values.background,
            unplayable: values.unplayable,
            updatedAt: Date.now(),
            content: {
              word: values.word || '',
              position: values.wordPosition || 1,
              align: values.wordAlign,
              size: values.wordSize,
              color: values.wordColor,
              borderColor: values.wordBorderColor,
              borderWidth: values.wordBorderWidth,
            },
          } as EscapeRoomWordCardType;
          break;

        default:
          throw new Error('Invalid card type');
      }

      addCardToUpdate(card.id, card);
      message.success(`${values.type} card ${card.id} created successfully!`);

      // Reset form for next card
      const defaultType = 'ANNOUNCEMENT';
      form.resetFields();
      form.setFieldsValue({ type: defaultType, id: generateNewCardId(defaultType) });
      setPreviewCard(null);
      setIsEditMode(false); // Exit edit mode after saving
    } catch {
      message.error('Please fill in all required fields');
    }
  };

  /**
   * Reset form to default values
   */
  const onResetForm = () => {
    const defaultType = 'ANNOUNCEMENT';
    form.resetFields();
    form.setFieldsValue({ type: defaultType, id: generateNewCardId(defaultType) });
    setPreviewCard(null);
    setIsEditMode(false); // Exit edit mode when resetting
  };

  return (
    <Flex className="full-width py-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={5}>
          Card Creator
        </Typography.Title>
        <Space>
          <Button onClick={onResetForm}>Reset</Button>
          <Button icon={<SaveOutlined />} onClick={onSaveCard} type="primary">
            Save Card
          </Button>
        </Space>
      </Flex>

      {/* Card Selection Section */}
      <Card size="small">
        <Flex align="center" gap={12}>
          <Typography.Text strong>Work with existing card:</Typography.Text>
          <Select
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => setSelectedCardId(value)}
            options={cardOptions}
            placeholder="Select a card"
            showSearch
            style={{ width: 400 }}
            value={selectedCardId}
          />
          <Button disabled={!selectedCardId} icon={<EditOutlined />} onClick={onEditCard} type="default">
            Edit
          </Button>
          <Button disabled={!selectedCardId} icon={<CopyOutlined />} onClick={onDuplicateCard} type="default">
            Duplicate
          </Button>
        </Flex>
      </Card>

      <Flex gap={24}>
        {/* Form Section */}
        <Card className="flex-1" title="Card Configuration">
          <Form
            form={form}
            initialValues={{ ...DEFAULT_FORM, id: generateNewCardId('ANNOUNCEMENT') }}
            layout="vertical"
            size="small"
          >
            {/* Card Type - Must be selected first as it determines the ID format */}
            <Form.Item label="Card Type" name="type" rules={[{ required: true }]}>
              <Select
                disabled={isEditMode}
                onChange={(value) => {
                  const newId = generateNewCardId(value as 'ANNOUNCEMENT' | 'MISSION' | 'IMAGE' | 'WORD');
                  form.setFieldValue('id', newId);
                }}
              >
                <Select.Option value="ANNOUNCEMENT">Announcement Card</Select.Option>
                <Select.Option value="MISSION">Mission Card</Select.Option>
                <Select.Option value="IMAGE">Image Card</Select.Option>
                <Select.Option value="WORD">Word Card</Select.Option>
              </Select>
            </Form.Item>

            {/* Card ID - Auto-generated based on card type */}
            <Form.Item label="Card ID" name="id" rules={[{ required: true, message: 'Card ID is required' }]}>
              <Space.Compact>
                <Input
                  placeholder="er-announcement-abc"
                  readOnly
                  style={{ width: 'calc(100% - 32px)' }}
                  value={previewCard?.id || ''}
                />
                <Button
                  disabled={isEditMode}
                  icon={<ReloadOutlined />}
                  onClick={onRegenerateId}
                  title={isEditMode ? 'Cannot change ID when editing' : 'Generate new ID'}
                  type="default"
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              label="Doc"
              name="doc"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea placeholder="Brief description of the card" rows={2} />
            </Form.Item>

            <Form.Item label="Background" name="background" rules={[{ required: true }]}>
              <AutoComplete
                filterOption={(inputValue, option) =>
                  option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                }
                options={Object.keys(BACKGROUNDS).map((key) => ({ value: key, label: key }))}
                placeholder="Select from list or enter custom background"
              />
            </Form.Item>

            <Form.Item label="Unplayable Card" name="unplayable" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Divider dashed />

            {/* Dynamic fields based on card type */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, setFieldValue }) => {
                const cardType = getFieldValue('type');

                // Auto-set mission background when mission type is selected
                if (cardType === 'MISSION' && getFieldValue('background') !== 'mission') {
                  setFieldValue('background', 'mission');
                }

                if (cardType === 'ANNOUNCEMENT') {
                  return (
                    <>
                      <Form.Item label="Title" name="announcementTitle">
                        <Input placeholder="Announcement title" />
                      </Form.Item>
                      <Form.Item label="Subtitle" name="announcementSubtitle">
                        <Input placeholder="Announcement subtitle (optional)" />
                      </Form.Item>
                    </>
                  );
                }

                if (cardType === 'MISSION') {
                  return (
                    <>
                      <Form.Item
                        label="Mission Number"
                        name="missionNumber"
                        rules={[{ required: true, message: 'Mission number is required' }]}
                      >
                        <InputNumber
                          max={10}
                          min={1}
                          placeholder="Mission number"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Mission Title"
                        name="missionTitle"
                        rules={[{ required: true, message: 'Mission title is required' }]}
                      >
                        <Input placeholder="Mission title" />
                      </Form.Item>
                      <Form.Item
                        label="Mission Description"
                        name="missionParagraphs"
                        rules={[{ required: true, message: 'Mission description is required' }]}
                      >
                        <Input.TextArea placeholder="Mission description (supports markdown)" rows={4} />
                      </Form.Item>
                      <Form.Item
                        label="Mission Action"
                        name="missionAction"
                        rules={[{ required: true, message: 'Mission action is required' }]}
                      >
                        <Input.TextArea placeholder="What players need to do (supports markdown)" rows={3} />
                      </Form.Item>
                    </>
                  );
                }

                if (cardType === 'IMAGE') {
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Image cards don't have additional content fields. They display based on their card ID
                      and background.
                    </div>
                  );
                }

                if (cardType === 'WORD') {
                  return (
                    <>
                      <Form.Item
                        label="Word"
                        name="word"
                        rules={[{ required: true, message: 'Word is required' }]}
                      >
                        <Input placeholder="Enter the word to display" />
                      </Form.Item>
                      <Form.Item label="Position" name="wordPosition" rules={[{ required: true }]}>
                        <InputNumber
                          max={14}
                          min={0}
                          placeholder="Position on card (0-14)"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item label="Text Alignment" name="wordAlign">
                        <Select placeholder="Select alignment">
                          <Select.Option value="left">Left</Select.Option>
                          <Select.Option value="center">Center</Select.Option>
                          <Select.Option value="right">Right</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="Text Size" name="wordSize">
                        <Select placeholder="Select size">
                          <Select.Option value="small">Small</Select.Option>
                          <Select.Option value="medium">Medium</Select.Option>
                          <Select.Option value="large">Large</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="Text Color" name="wordColor">
                        <Input placeholder="CSS color (e.g., #FF0000, red)" type="color" />
                      </Form.Item>
                      <Form.Item label="Border Color" name="wordBorderColor">
                        <Input placeholder="CSS color (e.g., #000000, black)" type="color" />
                      </Form.Item>
                      <Form.Item label="Border Width (px)" name="wordBorderWidth">
                        <InputNumber
                          max={20}
                          min={0}
                          placeholder="Border width in pixels"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </>
                  );
                }

                return null;
              }}
            </Form.Item>
          </Form>
        </Card>

        {/* Preview Section */}
        <div style={{ width: 300, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
          <Card size="small" title={`Preview: ${previewCard?.id || ''}`}>
            {previewCard ? (
              <EscapeRoomCard card={previewCard} width={250} />
            ) : (
              <div
                style={{
                  height: 375,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                Fill in card details to see preview
              </div>
            )}
          </Card>
        </div>
      </Flex>
    </Flex>
  );
}

// console.log(
//   JSON.parse(
//     `{"er-mission-eiua-A":{"id":"er-mission-eiua-A","doc":"play small "fácil"","background":"mission","unplayable":false,"content":[{"pos":1,"type":"title","text":"Um simples começo","size":"medium","align":"center","variant":"button"},{"pos":1,"type":"text-box","text":"Para completar missões, os jogadores devem analisar suas cartas, trocar informações e desobrir qual(is) cartas devem ser usadas.","size":"small","align":"center","variant":"boxed"},{"pos":3,"type":"text-box","text":"O resultado dessa missão é **facinho**.","size":"medium","align":"center","variant":"contained"}],"type":"mission","number":1,"name":"Um simples começo"}}`,
//   ),
// );

// Em cada missão, vocês devem discutir as cartas que têm para decidir o que jogar, porque depois que jogarem algo, não há mais volta. Vamos começar...
// O resultado dessa missão é **facinho**
