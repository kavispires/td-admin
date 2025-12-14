import { DatabaseOutlined } from '@ant-design/icons';
import { Alert, App, Button, Collapse, Input, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import type { SuspectCard, SuspectExtendedInfo } from 'types';

type AddDataModalProps = {
  suspect: SuspectCard;
  suspectExtendedInfo: SuspectExtendedInfo;
  addSuspectExtendedInfo: (id: string, item: SuspectExtendedInfo) => void;
};

export function AddDataModal({ suspect, suspectExtendedInfo, addSuspectExtendedInfo }: AddDataModalProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);

  const handleDataInsertion = () => {
    const parsed = JSON.parse(jsonInput) as Partial<SuspectExtendedInfo>;
    const updatedData: SuspectExtendedInfo = {
      ...suspectExtendedInfo,
      ...parsed,
    };
    addSuspectExtendedInfo(suspect.id, updatedData);
    message.success('Suspect extended info updated successfully');
    setOpen(false);
    setJsonInput('');
  };

  const validateJson = (value: string) => {
    setError(null);
    try {
      const parsed = JSON.parse(value);
      // Check if parse values has any keys not in SuspectExtendedInfo
      const allowedKeys = [
        'persona',
        'prompt',
        'description',
        'animal',
        'occupation',
        'sexualOrientation',
        'ethnicity',
        'economicClass',
        'educationLevel',
        'traits',
      ];
      const hasInvalidKeys = Object.keys(parsed).some((key) => !allowedKeys.includes(key));
      if (hasInvalidKeys) {
        throw new Error(
          `Invalid keys found: ${Object.keys(parsed)
            .filter((key) => !allowedKeys.includes(key))
            .join(', ')}`,
        );
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

  return (
    <>
      <Tooltip title="Add JSON partial data">
        <Button icon={<DatabaseOutlined />} onClick={() => setOpen(true)} size="small">
          Add
        </Button>
      </Tooltip>
      <Modal
        okButtonProps={{
          disabled: !!error || !jsonInput.trim(),
          icon: <DatabaseOutlined />,
        }}
        onCancel={handleCancel}
        onOk={handleDataInsertion}
        open={open}
        title={`JSON Partial Data for ${suspect.name} (${suspect.id})`}
      >
        <Collapse size="small">
          <Collapse.Panel header="Instructions" key="instructions">
            <p>
              You can add or update specific fields for this suspect by providing a JSON partial data. This
              allows you to modify only the fields you want without affecting the rest of the data.
            </p>
            <p>Make sure the JSON is properly formatted.</p>
            Only include the fields you want to add or update for this suspect. For example:
            <pre>
              {`{
  "occupation": "Detective",
  "traits": ["Brave", "Clever"]
}`}
            </pre>
            This will update the occupation and traits fields for the suspect.
          </Collapse.Panel>
        </Collapse>

        <Input.TextArea
          autoSize={{ minRows: 10, maxRows: 20 }}
          defaultValue={'{}'}
          onChange={(e) => validateJson(e.target.value)}
          placeholder="Paste JSON partial data here"
          value={jsonInput}
        />
        {error && <Alert message={`Error: ${error}`} type="error" />}
      </Modal>
    </>
  );
}
