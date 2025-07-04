import { Col, Row, Typography } from 'antd';
import { CardEntry } from 'components/ResourceCards';

type ResourceCardsProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceCards({ response, resourceName }: ResourceCardsProps) {
  const list: any[] = Object.values(response);

  return (
    <>
      <Typography.Title level={2}>Cards ({list.length})</Typography.Title>

      <Row gutter={[16, 16]}>
        {list.map((entry) => {
          return (
            <Col key={entry.id} lg={8} md={4} sm={6} xl={6} xs={6}>
              <CardEntry entry={entry} kind={resourceName ?? ''} />
            </Col>
          );
        })}
      </Row>
    </>
  );
}
