import OpenAIOutlined from '@ant-design/icons/lib/icons/OpenAIOutlined';
import { Button, Flex, Input, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useState } from 'react';
import type { SuspectCard } from 'types';

export const PROMPT_KEY = 'TD_ADMIN_SUSPECTS_PROMPT';

export function PromptBuilder() {
  const [prompt, setPrompt] = useState(
    localStorage.getItem(PROMPT_KEY) ??
      "Make a pixar version of this image, keep the Polaroid frame and aspect ratio at 2:3. It's a",
  );

  // Save to localStorage on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    localStorage.setItem(PROMPT_KEY, newValue);
  };

  return (
    <Flex align="center" className="my-2" gap={8}>
      <Typography.Text>Prompt Prefix:</Typography.Text>
      <Input onChange={handleChange} placeholder="AI Prompt" style={{ width: 320 }} value={prompt} />
    </Flex>
  );
}

type PromptButtonProps = {
  suspect: SuspectCard;
};

export function PromptButton({ suspect }: PromptButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();

  const handleClick = () => {
    const prompt = localStorage.getItem(PROMPT_KEY) ?? '';
    const formattedPrompt = `${prompt} ${suspect.prompt}`;
    copyToClipboard(formattedPrompt);
  };

  return (
    <Button onClick={handleClick} size="small">
      <OpenAIOutlined />
    </Button>
  );
}
