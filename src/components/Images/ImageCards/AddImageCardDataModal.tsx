import { DatabaseOutlined } from '@ant-design/icons';
import type { ImageCardDescriptorData } from '@types';
import { Alert, App, Button, Collapse, Flex, Input, InputNumber, Modal, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { ImageCard } from '../ImageCard';

type AddImageCardDataModalProps = {
  addEntryToUpdate: (id: string, item: ImageCardDescriptorData) => void;
};

export function AddImageCardDataModal({ addEntryToUpdate }: AddImageCardDataModalProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const [buildId, setBuildId] = useState<[number, number]>([1, 1]);

  const handleAdd = () => {
    const parsed = JSON.parse(jsonInput) as Partial<ImageCardDescriptorData>;

    // Use provided ID or generate from buildId
    const cardId = parsed.id || `td-d${buildId[0].toString()}-${buildId[1].toString().padStart(2, '0')}`;

    const updatedData: ImageCardDescriptorData = {
      id: cardId,
      title: parsed.title || { en: '', pt: '' },
      description: parsed.description || { en: '', pt: '' },
      keywords: parsed.keywords || { en: '', pt: '' },
      favorite: parsed.favorite,
      triggers: parsed.triggers,
      associatedDreams: parsed.associatedDreams,
      updatedAt: Date.now(),
    };

    // Remove any undefined fields that are optional
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key as keyof ImageCardDescriptorData] === undefined) {
        delete updatedData[key as keyof ImageCardDescriptorData];
      }
    });

    addEntryToUpdate(cardId, updatedData);

    message.success(`Image card descriptor ${cardId} added successfully`);
    setJsonInput('{}');

    // Update buildId based on the card ID (either provided or generated)
    const idMatch = cardId.match(/^td-d(\d+)-(\d+)$/);
    if (idMatch) {
      const deck = Number.parseInt(idMatch[1], 10);
      const unit = Number.parseInt(idMatch[2], 10);
      // Increment the unit number for next card
      setBuildId([deck, unit + 1]);
    } else {
      // Fallback: just increment the unit if ID doesn't match expected format
      setBuildId((prev) => [prev[0], prev[1] + 1]);
    }
  };

  const validateJson = (value: string) => {
    setError(null);
    try {
      const parsed = JSON.parse(value);

      // Check if it's an object
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        throw new Error('JSON must be an object');
      }

      // Validate allowed keys
      const allowedKeys = [
        'id',
        'title',
        'description',
        'keywords',
        'favorite',
        'triggers',
        'associatedDreams',
      ];

      const cardData = parsed as Record<string, unknown>;
      const invalidKeys = Object.keys(cardData).filter((key) => !allowedKeys.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(`Invalid keys found: ${invalidKeys.join(', ')}`);
      }

      // Validate dual language fields
      const dualLangFields = ['title', 'description', 'keywords'];
      for (const field of dualLangFields) {
        const fieldValue = cardData[field];
        if (fieldValue) {
          if (
            typeof fieldValue !== 'object' ||
            fieldValue === null ||
            (!(fieldValue as { en?: string }).en && !(fieldValue as { pt?: string }).pt)
          ) {
            throw new Error(`${field} must be an object with 'en' and/or 'pt' properties`);
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid JSON');
    }
    setJsonInput(value);
  };

  const handleCancel = () => {
    setOpen(false);
    setError(null);
    setJsonInput('');
  };

  const imageId = `td-d${buildId[0].toString()}-${buildId[1].toString().padStart(2, '0')}`;

  return (
    <>
      <Tooltip title="Add JSON data for a card">
        <Button
          block
          icon={<DatabaseOutlined />}
          onClick={() => setOpen(true)}
        >
          Add Card Data
        </Button>
      </Tooltip>
      <Modal
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
          >
            Cancel
          </Button>,
          <Button
            disabled={!!error || !jsonInput.trim()}
            icon={<DatabaseOutlined />}
            key="add"
            onClick={handleAdd}
          >
            Add
          </Button>,
        ]}
        mask={{ closable: false }}
        onCancel={handleCancel}
        open={open}
        title="Add/Update Image Card Descriptor via JSON"
        width={700}
      >
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto' }}>
          <Flex vertical>
            <Collapse size="small">
              <Collapse.Panel
                header="Instructions"
                key="instructions"
              >
                <p>
                  You can add or update an image card descriptor by providing JSON data. If you include an{' '}
                  <code>id</code> field, it will use that ID; otherwise, it will generate an ID from the deck
                  and unit numbers above.
                </p>
                <p>Make sure the JSON is properly formatted.</p>
                <p>Only include the fields you want to add or update. For example:</p>
                <pre>
                  {`{
  "title": { "en": "Sunset", "pt": "Pôr do sol" },
  "description": {
    "en": "A beautiful sunset over the ocean",
    "pt": "Um lindo pôr do sol sobre o oceano"
  },
  "keywords": { "en": "sunset,ocean,sky", "pt": "pôr do sol,oceano,céu" },
  "favorite": true,
  "triggers": ["scenic"],
  "associatedDreams": ["dream-001", "dream-002"]
}`}
                </pre>
                <p>Or with a specific ID:</p>
                <pre>
                  {`{
  "id": "td-d1-042",
  "title": { "en": "Mountain", "pt": "Montanha" },
  "keywords": { "en": "mountain,peak", "pt": "montanha,pico" }
}`}
                </pre>
                <p>
                  <strong>Fields:</strong>
                </p>
                <ul>
                  <li>
                    <code>id</code> (optional): Card ID (e.g., "td-d01-001")
                  </li>
                  <li>
                    <code>title</code>, <code>description</code>, <code>keywords</code>: Objects with{' '}
                    <code>en</code> and/or <code>pt</code> properties
                  </li>
                  <li>
                    <code>favorite</code>: Boolean
                  </li>
                  <li>
                    <code>triggers</code>, <code>associatedDreams</code>: Arrays of strings
                  </li>
                </ul>
                <p>
                  <strong>Buttons:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Add</strong>: Adds the card and keeps the modal open (auto-increments unit number)
                  </li>
                  <li>
                    <strong>OK</strong>: Adds the card and closes the modal
                  </li>
                </ul>
              </Collapse.Panel>
            </Collapse>

            <Flex
              className="mt-4"
              gap={8}
            >
              <Typography.Text type="secondary">ID:</Typography.Text>{' '}
              <Input
                readOnly
                size="small"
                style={{ width: 48 }}
                value="td-d"
                variant="borderless"
              />
              <InputNumber
                max={20}
                min={1}
                onChange={(value) => setBuildId((prev) => [value || 1, prev[1]])}
                size="small"
                style={{ width: 56 }}
                value={buildId[0] ?? 1}
              />
              <Input
                readOnly
                size="small"
                style={{ width: 24 }}
                value="-"
                variant="borderless"
              />
              <InputNumber
                max={255}
                min={1}
                onChange={(value) => setBuildId((prev) => [prev[0], value || 1])}
                size="small"
                style={{ width: 64 }}
                value={buildId[1] ?? 1}
              />
            </Flex>
          </Flex>

          <ImageCard
            cardId={imageId}
            cardWidth={64}
          />
        </div>

        <Input.TextArea
          autoSize={{ minRows: 10, maxRows: 20 }}
          defaultValue={'{}'}
          onChange={(e) => validateJson(e.target.value)}
          placeholder="Paste JSON data here"
          style={{ marginTop: 12 }}
          value={jsonInput}
        />
        {error && (
          <Alert
            description={error}
            showIcon
            style={{ marginTop: 12 }}
            title="Validation Error"
            type="error"
          />
        )}
      </Modal>
    </>
  );
}
