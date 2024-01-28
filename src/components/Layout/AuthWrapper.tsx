import type { User } from 'firebase/auth';

import { Alert, Spin } from 'antd';
import { ReactNode, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { auth } from 'services/firebase';

type AuthWrapperProps = {
  children: ReactNode;
};

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffectOnce(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticatedUser(user);
      } else {
        setAuthenticatedUser(null);
      }

      setIsLoading(false);
    });
  });

  if (isLoading) {
    return (
      <Spin tip="Verifying auth..." size="large">
        <div style={{ height: '100svh', width: '100svw' }} />
      </Spin>
    );
  }

  if (!authenticatedUser) {
    return (
      <div style={{ height: '100svh', width: '100svw', display: 'grid', placeItems: 'center' }}>
        <Alert
          message="You are not logged in"
          description="This app does not feature login capabilities."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return <>{children}</>;
}
