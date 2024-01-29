import { Divider, Form, Tag } from 'antd';

type TagStateProps = {
  isLoading: boolean;
  isIdle?: boolean;
  error?: ResponseError;
  hasResponseData: boolean;
};

export function TagState({ isLoading, isIdle, error, hasResponseData }: TagStateProps) {
  if (isIdle) return <Tag>No Data</Tag>;
  if (isLoading) return <Tag color="blue">Loading...</Tag>;
  if (error) return <Tag color="red">Error</Tag>;
  if (hasResponseData) return <Tag color="green">Loaded</Tag>;
  return <Tag>No Data</Tag>;
}

export function ResourceResponseState(props: TagStateProps) {
  return (
    <div className="sider-content">
      <Form.Item label="Status">
        <TagState {...props} />
      </Form.Item>
      <Divider />
    </div>
  );
}
