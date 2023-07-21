import { Input, Layout } from 'antd';
import { useState } from 'react';
import { useTitle } from 'react-use';
import { Header } from 'components/Layout/Header';
import { INITIAL_PARAMETERS, Parameters, ResourceParameters } from 'components/Resource/ResourceParameters';
import { SectionTitle } from 'components/Common/SectionTitle';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

export function ResourceGenerator() {
  useTitle('Resource Generator');
  const [parameters, setParameters] = useState<Parameters>(INITIAL_PARAMETERS);
  const [input, setInput] = useState('');

  const result = parseInput(input, parameters);
  const stringifiedResult = JSON.stringify(result, null, 4);

  return (
    <Layout className="container">
      <Header title="Resource Generator" />

      <Layout hasSider>
        <Layout.Sider className="sider">
          <ResourceParameters onUpdateParameters={setParameters} />
        </Layout.Sider>

        <Layout.Content className="content page-content page-content--5-5">
          <div className="one-side">
            <SectionTitle>Input</SectionTitle>
            <Input.TextArea
              name="output"
              id=""
              cols={15}
              rows={20}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="other-side">
            <SectionTitle>
              Output <CopyToClipboardButton content={stringifiedResult} />
            </SectionTitle>
            <Input.TextArea name="output" id="" cols={15} rows={20} readOnly value={stringifiedResult} />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

function parseInput(input: string, parameters: Parameters): Record<string, GenericCard> {
  const { prefix, language, startingId, headers: hasHeaders, transform } = parameters;

  if (!prefix) {
    return {};
  }

  const lines = input.split('\n');
  const headers = lines[0].split('\t');

  const data: Record<string, GenericCard> = {};

  for (let i = hasHeaders ? 1 : 0; i < lines.length; i++) {
    const currentLine = lines[i].split('\t');

    const id = `${prefix}-${startingId + (hasHeaders ? -1 : 0) + i}-${language}`;

    const card: GenericCard = {
      id,
    };

    if (hasHeaders) {
      for (let j = 0; j < headers.length; j++) {
        card[headers[j]] = transformText(currentLine[j]?.trim(), transform);
      }
    } else {
      card.text = transformText(currentLine[0]?.trim(), transform);
    }

    data[id] = card;
  }

  return data;
}

function transformText(text: string, transform: Parameters['transform']): string {
  if (transform === 'capitalize') {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  if (transform === 'lowercase') {
    return text.toLowerCase();
  }
  if (transform === 'uppercase') {
    return text.toUpperCase();
  }
  return text;
}
