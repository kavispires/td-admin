import { FireFilled } from '@ant-design/icons';
import { Button, Layout, Result } from 'antd';
import { PageLayout } from 'components/Layout';

type PageErrorProps = {
  /**
   * The title/short message for the error
   */
  message?: string;
  /**
   * The detailed error description
   */
  description?: string;
  /**
   * Optional callback to retry/reload
   */
  onRetry?: () => void;
};

/**
 * Full-page error display component using Ant Design Result
 * Used by ErrorBoundary and can be used for other error states
 */
export function PageError({ message = 'Something went wrong', description, onRetry }: PageErrorProps) {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <PageLayout title="TD Admin - Error">
      <Layout.Content className="content-center">
        <Result
          extra={
            <Button onClick={handleReload} type="primary">
              Reload Page
            </Button>
          }
          icon={<FireFilled style={{ color: '#ff4d4f' }} />}
          status="error"
          subTitle={description || 'An unexpected error occurred. Please try reloading the page.'}
          title={message}
        />
      </Layout.Content>
    </PageLayout>
  );
}
