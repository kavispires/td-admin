import ReactJsonView from '@microlink/react-json-view';
import { Alert, Button, Input, Space } from 'antd';
import { useGenerativeContent } from 'hooks/useGenerativeContent';
import { useState } from 'react';

export function AIGeneratorContent() {
  const [prompt, setPrompt] = useState('What is the capital of France?');
  const { data, isPending, isError, error, mutate } = useGenerativeContent();

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.TextArea
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        rows={4}
        value={prompt}
      />
      <Button loading={isPending} onClick={() => mutate(prompt)}>
        Fetch AI Response
      </Button>

      {isError && <Alert description={error?.message} message="AI Error" type="error" />}

      {data && <ReactJsonView src={JSON.parse(data) ?? {}} theme="twilight" />}
    </Space>
  );
}
