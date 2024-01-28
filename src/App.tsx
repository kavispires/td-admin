import { ConfigProvider } from 'antd';
import { ArteRuimGroups } from 'pages/ArteRuimGroups';
import { ArteRuimParser } from 'pages/ArteRuimParser';
import { CrimesHediondosCategorizer } from 'pages/CrimesHediondosCategorizer';
import { Home } from 'pages/Home';
import { Other } from 'pages/Other';
import { Resource } from 'pages/Resource';
import { ResourceGenerator } from 'pages/ResourceGenerator';
import { SingleWordsExpander } from 'pages/SingleWordsExpander';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "'Lato', sans-serif",
            colorPrimary: '#748599',
            colorError: '#F8C1D4',
            colorWarning: '#F3D6BC',
            colorSuccess: '#7FB28A',
            colorInfo: '#2a9d8f',
          },
        }}
      >
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resource" element={<Resource />} />
            <Route path="/resource-generator" element={<ResourceGenerator />} />

            <Route path="/arte-ruim-parser" element={<ArteRuimParser />} />
            <Route path="/arte-ruim-groups" element={<ArteRuimGroups />} />
            <Route path="/crimes-hediondos-categorizer" element={<CrimesHediondosCategorizer />} />
            <Route path="/single-words" element={<SingleWordsExpander />} />
            <Route path="/other" element={<Other />} />
          </Routes>
        </HashRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
