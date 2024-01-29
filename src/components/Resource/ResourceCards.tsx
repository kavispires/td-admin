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
            <Col xs={6} sm={6} md={4} lg={8} xl={6} key={entry.id}>
              <CardEntry entry={entry} kind={resourceName ?? ''} />
            </Col>
          );
        })}
      </Row>
    </>
  );
}
