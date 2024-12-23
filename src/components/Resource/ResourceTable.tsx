import { Col, Row, Table, Typography } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

import { useMemo } from 'react';

type ResourceCardsProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceTable({ response }: ResourceCardsProps) {
  const list: any[] = Object.values(response);

  const columns = useMemo(() => {
    const keys: Record<string, boolean> = {};

    list.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (keys[key] === undefined) {
          keys[key] = true;
        }
      });
    });

    return Object.keys(keys).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      render: (v: any) => {
        const content = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
        return (
          <span>
            {content} {!!content.trim() && <CopyToClipboardButton content={content} />}
          </span>
        );
      },
    }));
  }, [list]);

  return (
    <>
      <Typography.Title level={2}>Table ({list.length})</Typography.Title>

      <Row gutter={16}>
        <Col span={24}>
          <Table columns={columns} dataSource={list} />
        </Col>
      </Row>
    </>
  );
}
