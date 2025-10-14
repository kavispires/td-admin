import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
  App,
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
import { cloneDeep } from 'lodash';
import type { UseEscapeRoomResourceReturnType } from 'pages/EscapeRoom/useEscapeRoomResource';
import { useCallback, useMemo, useState } from 'react';
import { createUUID } from 'utils';
import { BACKGROUNDS } from './cards/CardBuildingBlocks';
import { EscapeRoomCard } from './cards/EscapeRoomCard';
import type {
  EscapeRoomCardContentType,
  EscapeRoomCardType,
  EscapeRoomContentCardType,
  EscapeRoomMissionCardType,
  SpriteLibraries,
} from './cards/escape-room-types';

type CardCreatorForm = {
  /** Card ID */
  id: string;
  /** Card type */
  type: 'CONTENT' | 'MISSION';
  /** Card description */
  doc: string;
  /** Mission number (only for mission cards) */
  number?: number;
  /** Mission name (only for mission cards) */
  name?: string;
  /** Background */
  background?: string;
  /** Whether the card is unplayable */
  unplayable?: boolean;
  /** Content items */
  content: ContentFormItem[];
};

type ContentFormItem = {
  /** Position in grid (0-14) */
  pos: number;
  /** Content type */
  type: 'TEXT_BOX' | 'TITLE' | 'LABEL' | 'SPRITE' | 'SVG_ICON' | 'DIGIT' | 'LETTER' | 'NUMBER';
  /** Text content */
  text?: string;
  /** Label content */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Box variant */
  variant?: 'contained' | 'boxed' | 'button';
  /** Sprite library */
  library?: SpriteLibraries;
  /** Sprite ID */
  spriteId?: string;
  /** Sprite scale */
  scale?: number;
  /** Sprite rotation */
  rotate?: number;
  /** Icon ID for SVG icons */
  iconId?: string;
  /** Number value */
  value?: number;
  /** Letter value */
  letter?: string;
};

const DEFAULT_CARD: CardCreatorForm = {
  id: '',
  type: 'CONTENT',
  doc: '',
  content: [],
};

const DEFAULT_CONTENT_ITEM: ContentFormItem = {
  pos: 1,
  type: 'TEXT_BOX',
  text: '',
  align: 'center',
  size: 'medium',
};

/**
 * Card Creator component for creating new Escape Room cards
 */
export function EscapeRoomCreateSet(query: UseEscapeRoomResourceReturnType) {
  const { addCardToUpdate, cards } = query;
  const { message } = App.useApp();

  const [form] = Form.useForm<CardCreatorForm>();
  const [previewCard, setPreviewCard] = useState<EscapeRoomCardType | null>(null);

  // Watch form values for preview
  const formValues = Form.useWatch([], form);

  // Generate unique card ID based on existing cards
  const generateCardId = useMemo(() => {
    const existingIds = Object.keys(cards);
    return createUUID(existingIds);
  }, [cards]);

  /**
   * Convert form data to proper card format
   */
  const convertFormToCard = useCallback(
    (values: CardCreatorForm): EscapeRoomCardType => {
      const baseCard = {
        id: values.id || generateCardId,
        doc: values.doc,
        background: values.background || 'default',
        unplayable: values.unplayable || false,
        content:
          values.content?.map((item): EscapeRoomCardContentType => {
            const baseContent = {
              pos: item.pos as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14,
            };

            switch (item.type) {
              case 'TITLE':
                return {
                  ...baseContent,
                  type: 'title',
                  text: item.text || '',
                  size: item.size,
                  align: item.align,
                  variant: item.variant,
                };
              case 'TEXT_BOX':
                return {
                  ...baseContent,
                  type: 'text-box',
                  text: item.text || '',
                  size: item.size,
                  align: item.align,
                  variant: item.variant,
                };
              case 'LABEL':
                return {
                  ...baseContent,
                  type: 'label',
                  label: item.label || item.text || '',
                  size: item.size,
                  align: item.align,
                  variant: item.variant,
                };
              case 'SPRITE':
                return {
                  ...baseContent,
                  type: 'sprite',
                  library: item.library || 'items',
                  spriteId: item.spriteId || '',
                  scale: item.scale,
                  rotate: item.rotate,
                  size: item.size,
                };
              case 'SVG_ICON':
                return {
                  ...baseContent,
                  type: 'svg-icon',
                  iconId: item.iconId || '',
                  align: item.align,
                };
              case 'DIGIT':
                return {
                  ...baseContent,
                  type: 'digit',
                  value: item.value || 0,
                  size: item.size,
                  align: item.align,
                };
              case 'LETTER':
                return {
                  ...baseContent,
                  type: 'letter',
                  letter: item.letter || 'A',
                  size: item.size,
                  align: item.align,
                };
              case 'NUMBER':
                return {
                  ...baseContent,
                  type: 'number',
                  value: item.value || 0,
                  size: item.size,
                  align: item.align,
                };
              default:
                return {
                  ...baseContent,
                  type: 'text-box',
                  text: item.text || '',
                };
            }
          }) || [],
      };

      switch (values.type) {
        case 'MISSION':
          return {
            ...baseCard,
            type: 'mission',
            number: values.number || 1,
            name: values.name || '',
          } as EscapeRoomMissionCardType;
        default:
          return {
            ...baseCard,
            type: 'content',
          } as EscapeRoomContentCardType;
      }
    },
    [generateCardId],
  );

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
   * Add new content item to the card
   */
  const addContentItem = () => {
    const currentContent = form.getFieldValue('content') || [];
    const newItem = cloneDeep(DEFAULT_CONTENT_ITEM);
    newItem.pos = currentContent.length + 1;

    form.setFieldValue('content', [...currentContent, newItem]);
  };

  /**
   * Remove content item from the card
   */
  const removeContentItem = (index: number) => {
    const currentContent = form.getFieldValue('content') || [];
    const updatedContent = currentContent.filter((_: ContentFormItem, i: number) => i !== index);
    form.setFieldValue('content', updatedContent);
  };

  /**
   * Save the card to database
   */
  const onSaveCard = async () => {
    try {
      const values = await form.validateFields();
      const card = convertFormToCard(values);

      addCardToUpdate(card.id, card);
      message.success(`Card ${card.id} created successfully!`);

      // Reset form for next card
      form.resetFields();
      form.setFieldValue('id', generateCardId);
      setPreviewCard(null);
    } catch {
      message.error('Please fill in all required fields');
    }
  };

  /**
   * Reset form to default values
   */
  const onResetForm = () => {
    form.resetFields();
    form.setFieldValue('id', generateCardId);
    setPreviewCard(null);
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
            Add Card
          </Button>
        </Space>
      </Flex>

      <Flex gap={24}>
        {/* Form Section */}
        <Card className="flex-1" title="Card Configuration">
          <Form
            form={form}
            initialValues={{ ...DEFAULT_CARD, id: generateCardId }}
            layout="vertical"
            size="small"
          >
            {/* Basic Card Info */}
            <Form.Item label="Card ID" name="id" rules={[{ required: true, message: 'Card ID is required' }]}>
              <Input placeholder="er-content-01" />
            </Form.Item>

            <Form.Item label="Card Type" name="type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="CONTENT">Content Card</Select.Option>
                <Select.Option value="MISSION">Mission Card</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="doc"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea placeholder="Brief description of the card" rows={2} />
            </Form.Item>

            {/* Mission-specific fields */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, setFieldValue }) => {
                const cardType = getFieldValue('type');
                const isMission = cardType === 'MISSION';

                // Auto-set mission number to 1 when mission type is selected
                if (isMission && !getFieldValue('number')) {
                  setFieldValue('number', 1);
                }

                return isMission ? (
                  <>
                    <Form.Item label="Mission Number" name="number">
                      <InputNumber max={10} min={1} placeholder="Defaults to 1" />
                    </Form.Item>
                    <Form.Item label="Mission Name" name="name" rules={[{ required: true }]}>
                      <Input placeholder="Mission name" />
                    </Form.Item>
                  </>
                ) : null;
              }}
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, setFieldValue }) => {
                const cardType = getFieldValue('type');
                const isMission = cardType === 'MISSION';

                // Auto-set mission background when mission type is selected
                if (isMission && getFieldValue('background') !== 'mission') {
                  setFieldValue('background', 'mission');
                }

                return (
                  <Form.Item label="Background" name="background">
                    <Select
                      disabled={isMission}
                      placeholder="Select background"
                      value={isMission ? 'mission' : undefined}
                    >
                      {Object.keys(BACKGROUNDS).map((key) => (
                        <Select.Option key={key} value={key}>
                          {key}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item label="Unplayable Card" name="unplayable" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Divider>Content Items</Divider>

            {/* Content Items */}
            <Form.List name="content">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Card
                      extra={
                        <Button
                          danger
                          onClick={() => {
                            remove(field.name);
                            removeContentItem(index);
                          }}
                          size="small"
                          type="text"
                        >
                          Remove
                        </Button>
                      }
                      key={field.key}
                      size="small"
                      title={`Content Item ${index + 1}`}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Flex gap={8}>
                          <Form.Item label="Position" name={[field.name, 'pos']} style={{ flex: 1 }}>
                            <InputNumber max={14} min={0} />
                          </Form.Item>
                          <Form.Item label="Type" name={[field.name, 'type']} style={{ flex: 2 }}>
                            <Select>
                              <Select.Option value="TEXT_BOX">Text Box</Select.Option>
                              <Select.Option value="TITLE">Title</Select.Option>
                              <Select.Option value="LABEL">Label</Select.Option>
                              <Select.Option value="SPRITE">Sprite</Select.Option>
                              <Select.Option value="SVG_ICON">SVG Icon</Select.Option>
                              <Select.Option value="DIGIT">Digit</Select.Option>
                              <Select.Option value="LETTER">Letter</Select.Option>
                              <Select.Option value="NUMBER">Number</Select.Option>
                            </Select>
                          </Form.Item>
                        </Flex>

                        {/* Dynamic fields based on content type */}
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            const contentType = getFieldValue(['content', field.name, 'type']);
                            return (
                              <>
                                {/* Text-based content */}
                                {['TEXT_BOX', 'TITLE'].includes(contentType) && (
                                  <Form.Item label="Text" name={[field.name, 'text']}>
                                    <Input.TextArea rows={2} />
                                  </Form.Item>
                                )}

                                {/* Label content */}
                                {contentType === 'LABEL' && (
                                  <Form.Item label="Label" name={[field.name, 'label']}>
                                    <Input />
                                  </Form.Item>
                                )}

                                {/* Sprite content */}
                                {contentType === 'SPRITE' && (
                                  <Flex gap={8}>
                                    <Form.Item label="Library" name={[field.name, 'library']}>
                                      <Select style={{ width: 120 }}>
                                        <Select.Option value="items">Items</Select.Option>
                                        <Select.Option value="warehouse-goods">Warehouse</Select.Option>
                                        <Select.Option value="glyphs">Glyphs</Select.Option>
                                        <Select.Option value="alien-signs">Alien Signs</Select.Option>
                                        <Select.Option value="emojis">Emojis</Select.Option>
                                      </Select>
                                    </Form.Item>
                                    <Form.Item label="Sprite ID" name={[field.name, 'spriteId']}>
                                      <Input style={{ width: 120 }} />
                                    </Form.Item>
                                  </Flex>
                                )}

                                {/* SVG Icon content */}
                                {contentType === 'SVG_ICON' && (
                                  <Form.Item label="Icon ID" name={[field.name, 'iconId']}>
                                    <Input />
                                  </Form.Item>
                                )}

                                {/* Number/Digit/Letter content */}
                                {['DIGIT', 'NUMBER'].includes(contentType) && (
                                  <Form.Item label="Value" name={[field.name, 'value']}>
                                    <InputNumber />
                                  </Form.Item>
                                )}

                                {contentType === 'LETTER' && (
                                  <Form.Item label="Letter" name={[field.name, 'letter']}>
                                    <Input maxLength={1} style={{ width: 80 }} />
                                  </Form.Item>
                                )}

                                {/* Common styling options */}
                                <Flex gap={8}>
                                  <Form.Item label="Size" name={[field.name, 'size']}>
                                    <Select style={{ width: 80 }}>
                                      <Select.Option value="small">Small</Select.Option>
                                      <Select.Option value="medium">Medium</Select.Option>
                                      <Select.Option value="large">Large</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <Form.Item label="Align" name={[field.name, 'align']}>
                                    <Select style={{ width: 80 }}>
                                      <Select.Option value="left">Left</Select.Option>
                                      <Select.Option value="center">Center</Select.Option>
                                      <Select.Option value="right">Right</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  {['TEXT_BOX', 'TITLE', 'LABEL'].includes(contentType) && (
                                    <Form.Item label="Variant" name={[field.name, 'variant']}>
                                      <Select style={{ width: 100 }}>
                                        <Select.Option value="contained">Contained</Select.Option>
                                        <Select.Option value="boxed">Boxed</Select.Option>
                                        <Select.Option value="button">Button</Select.Option>
                                      </Select>
                                    </Form.Item>
                                  )}
                                </Flex>
                              </>
                            );
                          }}
                        </Form.Item>
                      </Space>
                    </Card>
                  ))}
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      add(cloneDeep(DEFAULT_CONTENT_ITEM));
                      addContentItem();
                    }}
                    type="dashed"
                  >
                    Add Content Item
                  </Button>
                </>
              )}
            </Form.List>
          </Form>
        </Card>

        {/* Preview Section */}
        <div style={{ width: 300, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
          <Card size="small" title="Preview">
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
