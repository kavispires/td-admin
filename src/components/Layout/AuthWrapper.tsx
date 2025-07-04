import { Alert, App, Spin } from 'antd';
import type { User } from 'firebase/auth';
import { type ReactNode, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { auth } from 'services/firebase';

type AuthWrapperProps = {
  children: ReactNode;
};

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { message } = App.useApp();
  useEffectOnce(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticatedUser(user);
        message.info('You are logged in!');
      } else {
        setAuthenticatedUser(null);
      }

      setIsLoading(false);
    });
  });

  if (isLoading) {
    return (
      <Spin size="large" tip="Verifying auth...">
        <div style={{ height: '100svh', width: '100svw' }} />
      </Spin>
    );
  }

  if (!authenticatedUser) {
    return (
      <div style={{ height: '100svh', width: '100svw', display: 'grid', placeItems: 'center' }}>
        <Alert
          description="This app does not feature login capabilities."
          message="You are not logged in"
          showIcon
          type="error"
        />
      </div>
    );
  }

  return <>{children}</>;
}
