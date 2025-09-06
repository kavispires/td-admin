import OpenAIOutlined from '@ant-design/icons/lib/icons/OpenAIOutlined';
import { Button, Flex, Input, Switch, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useState } from 'react';
import type { SuspectCard } from 'types';

export const PROMPT_KEY = 'TD_ADMIN_SUSPECTS_PROMPT';
export const PROMPT_SUFFIX_KEY = 'TD_ADMIN_SUSPECTS_PROMPT_SUFFIX';

export function PromptBuilder() {
  const [prompt, setPrompt] = useState(
    localStorage.getItem(PROMPT_KEY) ??
      "Make a pixar version of this image, keep the Polaroid frame and aspect ratio at 2:3. It's a",
  );
  const [suffix, setSuffix] = useState(localStorage.getItem(PROMPT_SUFFIX_KEY) === 'true');

  // Save to localStorage on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    localStorage.setItem(PROMPT_KEY, newValue);
  };

  const handleSuffixChange = (checked: boolean) => {
    setSuffix(checked);
    localStorage.setItem(PROMPT_SUFFIX_KEY, checked ? 'true' : 'false');
  };

  return (
    <Flex align="center" className="my-2" gap={8}>
      <Typography.Text>Prompt Prefix:</Typography.Text>
      <Input onChange={handleChange} placeholder="AI Prompt" style={{ width: 320 }} value={prompt} />
      <Switch
        checked={suffix}
        checkedChildren="Include Features"
        onChange={handleSuffixChange}
        unCheckedChildren="No Features"
      />
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
    let formattedPrompt = `${prompt} ${suspect.prompt}`;

    const includeFeatures = localStorage.getItem(PROMPT_SUFFIX_KEY) === 'true';
    if (includeFeatures) {
      formattedPrompt += ` make sure it has the following features: ${suspect.features.join(', ')}`;
    }
    console.log(formattedPrompt);
    copyToClipboard(formattedPrompt);
  };

  return (
    <Button onClick={handleClick} size="small">
      <OpenAIOutlined />
    </Button>
  );
}
