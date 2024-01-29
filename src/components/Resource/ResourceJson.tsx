import { Col, Input, Row, Typography } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

import { useMemo } from 'react';

import { SearchDuplicates } from '../SearchDuplicates';

import { SEARCH_PROPERTY } from '../../utils/constants';

type ResourceJsonProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceJson({ response, resourceName }: ResourceJsonProps) {
  const property = resourceName ? SEARCH_PROPERTY[resourceName] : 'text';

  const jsonString = useMemo(() => JSON.stringify(response, null, 4), [response]);

  return (
    <>
      <Typography.Title level={2}>
        JSON <CopyToClipboardButton content={jsonString} />
      </Typography.Title>

      <Row gutter={16}>
        <Col span={16}>
          <Input.TextArea name="output" id="" cols={15} rows={30} readOnly value={jsonString} />
        </Col>
        <Col span={8}>
          <SearchDuplicates response={response} property={property} />
        </Col>
      </Row>
    </>
  );
}
