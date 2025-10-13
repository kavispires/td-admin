import { router } from 'Routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { AuthWrapper } from 'components/Layout';
import { RouterProvider } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      // staleTime: Infinity,
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            // fontFamily: "'Lato', sans-serif",
            // colorPrimary: '#748599',
            // colorError: '#F8C1D4',
            // colorWarning: '#F3D6BC',
            // colorSuccess: '#7FB28A',
            // colorInfo: '#2a9d8f',
          },
        }}
      >
        <AntApp>
          <AuthWrapper>
            <RouterProvider router={router} />
          </AuthWrapper>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
