import { Form, Tag } from 'antd';
import { SiderContent } from 'components/Layout';

type TagStateProps = {
  /**
   * The data is loading
   */
  isLoading: boolean;
  /**
   * The data hasn't run a query yet
   */
  isIdle?: boolean;
  /**
   * The data has an error
   */
  isError?: boolean;
  /**
   * The data has an error
   */
  error?: ResponseError;
  /**
   * The data has been modified
   */
  isDirty?: boolean;
  /**
   * There is a response
   */
  hasResponseData: boolean;
};

export function TagState({ isLoading, isIdle, error, isDirty, isError, hasResponseData }: TagStateProps) {
  if (isIdle) return <Tag>No Data yet</Tag>;
  if (isLoading) return <Tag color="blue">Loading...</Tag>;
  if (error || isError) return <Tag color="red">Error</Tag>;
  if (isDirty) return <Tag color="orange">Modified</Tag>;
  if (hasResponseData) return <Tag color="green">Loaded</Tag>;
  return <Tag>No Data</Tag>;
}

export function ResponseState(props: TagStateProps) {
  return (
    <SiderContent>
      <Form.Item label="Status">
        <TagState {...props} />
      </Form.Item>
    </SiderContent>
  );
}
