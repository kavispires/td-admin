import { Input, Typography } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

import { useMemo } from 'react';

import { SearchDuplicates } from '../components/SearchDuplicates';

import { SEARCH_PROPERTY } from '../utils/constants';

const { Title } = Typography;

type ResourceJsonProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceJson({ response, resourceName }: ResourceJsonProps) {
  const property = resourceName ? SEARCH_PROPERTY[resourceName] : 'text';

  const jsonString = useMemo(() => JSON.stringify(response, null, 4), [response]);

  return (
    <div className="page-content page-content--6-4">
      <main>
        <Title level={2}>
          JSON <CopyToClipboardButton content={jsonString} />
        </Title>
        <Input.TextArea name="output" id="" cols={15} rows={15} readOnly value={jsonString} />
      </main>
      <aside>
        <SearchDuplicates response={response} property={property} />
      </aside>
    </div>
  );
}
