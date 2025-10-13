import { Alert, App, Button, Flex, Form, Input, Modal, Spin } from 'antd';
import type { User } from 'firebase/auth';
import { type ReactNode, useState } from 'react';
import { useEffectOnce, useKeyPressEvent } from 'react-use';
import { auth, signIn } from 'services/firebase';

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
        <LoginModal />
      </div>
    );
  }

  return <>{children}</>;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 0, span: 8 },
};

function LoginModal() {
  const [open, setOpen] = useState(0);
  useKeyPressEvent('Escape', () => setOpen((v) => v + 1));

  const [error, setError] = useState<string | object | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onValuesChange = (data: PlainObject) => {
    if (data.email) {
      setEmail(data.email.trim());
    }
    if (data.password) {
      setPassword(data.password.trim());
    }
  };

  const onHandleSubmit = async () => {
    setError('');
    try {
      const response = await signIn(email, password);
      if (response?.user?.uid) {
        console.log('Login successful');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <Modal footer={null} open={open > 3} title="Login">
      {Boolean(error) && (
        <Alert
          className="login__error-alert"
          description={JSON.stringify(error)}
          message="Error"
          showIcon
          type="error"
        />
      )}
      <Form
        {...layout}
        autoComplete="off"
        className="login__form"
        layout="horizontal"
        name="sign-in"
        onValuesChange={onValuesChange}
      >
        <Form.Item {...tailLayout} className="login__form-item" label="E-mail" name="email">
          <Input type="email" />
        </Form.Item>
        <Form.Item {...tailLayout} className="login__form-item" label="Password" name="password">
          <Input type="password" />
        </Form.Item>
        <Flex justify="flex-end">
          <Button onClick={onHandleSubmit} type="primary">
            Login
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
}
