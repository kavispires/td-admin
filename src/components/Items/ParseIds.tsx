import { Button, Input, Typography } from 'antd';
import { useState } from 'react';

type PasteIdsProps = {
  onUpdateBatch: (itemId: string[]) => void;
};

export function PasteIds({ onUpdateBatch }: PasteIdsProps) {
  const [str, setStr] = useState('');

  const onAdd = () => {
    try {
      // Remove any enclosing square brackets
      const parsedStr = str.replace(/^\[|\]$/g, '');

      // Split the string by commas, possibly surrounded by spaces
      const idArray = parsedStr
        .split(/\s*,\s*/)
        .map((item) => item.replace(/^"|"$/g, ''))
        .filter(Boolean);

      onUpdateBatch(idArray);

      setStr('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Typography.Paragraph>
      Paste IDs
      <Input.TextArea onChange={(e) => setStr(e.target.value)} value={str} />
      <Button onClick={onAdd} size="small">
        Add
      </Button>
    </Typography.Paragraph>
  );
}
