import OpenAIOutlined from '@ant-design/icons/lib/icons/OpenAIOutlined';
import { App, Button, Flex, Input, Switch, Typography } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import { useState } from 'react';
import type { SuspectCard, SuspectExtendedInfo } from 'types';

export const PROMPT_KEY = 'TD_ADMIN_SUSPECTS_PROMPT';
export const PROMPT_SUFFIX_KEY = 'TD_ADMIN_SUSPECTS_PROMPT_SUFFIX';

const PROMPTS = {
  ghibli: "Make this picture ghibli style in 2:3 aspect-ratio. It's a", // Used with an original picture,
  fox: "Now make the image in the Family Guy style, aspect ratio at 2:3. It's a",
  pixar: "Now make the image in the 3d Pixar style, aspect ratio at 2:3. It's a",
  realistic:
    "Make this image realistic style, keep the Polaroid frame (don't make the image granular) and aspect ratio at 2:3. It's a",
  zootopia:
    "Make this image to look like a character from Zootopia, keep the Polaroid frame (don't make the image granular) and aspect ratio at 2:3. It's a",
};

export function PromptBuilder() {
  const [prompt, setPrompt] = useState(
    localStorage.getItem(PROMPT_KEY) ??
      "Make a pixar version of this image, keep the Polaroid frame and aspect ratio at 2:3. It's a",
  );
  const [suffix, setSuffix] = useState(localStorage.getItem(PROMPT_SUFFIX_KEY) === 'true');
  const { queryParams } = useQueryParams();

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
    <Flex align="center" gap={8}>
      <Typography.Text>Custom Prompt:</Typography.Text>
      <Input
        disabled={queryParams.has('prompt')}
        onChange={handleChange}
        placeholder="AI Prompt"
        style={{ width: 320 }}
        value={prompt}
      />
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
  extendedInfo: SuspectExtendedInfo;
};

export function PromptButton({ suspect, extendedInfo }: PromptButtonProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  const { notification } = App.useApp();

  const { queryParams } = useQueryParams();
  const promptQP = queryParams.get('prompt');

  const handleClick = () => {
    console.log('promptQP', promptQP);
    let prompt = !promptQP
      ? (localStorage.getItem(PROMPT_KEY) ?? '')
      : PROMPTS[promptQP as keyof typeof PROMPTS];

    if (promptQP === 'zootopia') {
      if (!extendedInfo.animal) {
        notification.error({
          title: 'Error',
          description: 'Suspect does not have an animal type defined.',
        });
        return;
      }
      prompt += `${extendedInfo.animal} `;
    }

    if (!extendedInfo.prompt) {
      notification.error({
        title: 'Error',
        description: 'Suspect does not have a prompt defined.',
      });
      return;
    }

    let formattedPrompt = `${prompt} ${extendedInfo.prompt}`;

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

export function DescriptionPromptButton({ extendedInfo }: { extendedInfo: SuspectExtendedInfo }) {
  const copyToClipboard = useCopyToClipboardFunction();

  const handleClick = () => {
    let prompt = '';

    if (extendedInfo.persona.en) {
      prompt += `This one is: "${extendedInfo.persona.en}" `;
    }

    prompt += `Here is some info about the character: ${extendedInfo.prompt}`;

    if (extendedInfo.economicClass) {
      prompt += `(${extendedInfo.economicClass} class)`;
    }
    if (extendedInfo.educationLevel) {
      prompt += `(${extendedInfo.educationLevel} education)`;
    }
    if (extendedInfo.sexualOrientation) {
      prompt += `(${extendedInfo.sexualOrientation})`;
    }

    copyToClipboard(prompt);
  };

  return (
    <Button onClick={handleClick} size="small">
      <OpenAIOutlined />
    </Button>
  );
}
