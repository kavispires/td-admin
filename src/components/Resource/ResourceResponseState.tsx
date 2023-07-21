import { Divider, Form, Tag } from 'antd';

type TagStateProps = {
  isLoading: boolean;
  error?: ResponseError;
  hasResponseData: boolean;
};

function TagState({ isLoading, error, hasResponseData }: TagStateProps) {
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
