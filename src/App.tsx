import { App as AntApp, ConfigProvider, theme } from 'antd';
import { AuthWrapper } from 'components/Layout';
import { ArteRuimGroups } from 'pages/ArteRuimGroups';
import { ArteRuimParser } from 'pages/ArteRuimParser';
import { CrimesHediondosCategorizer } from 'pages/CrimesHediondosCategorizer';
import { Home } from 'pages/Home';
import { ImagesAlienItems } from 'pages/ImagesAlienItems';
import { ImagesCrimeEvidence } from 'pages/ImagesCrimeEvidence';
import { ImagesCrimeWeapons } from 'pages/ImagesCrimeWeapons';
import { ImagesImageCards } from 'pages/ImagesImageCards';
import { ImagesSuspects } from 'pages/ImagesSuspects';
import { Other } from 'pages/Other';
import { Resource } from 'pages/Resource';
import { ResourceGenerator } from 'pages/ResourceGenerator';
import { SingleWordsExpander } from 'pages/SingleWordsExpander';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DailySetup } from 'pages/DailySetup';

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
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resource" element={<Resource />} />
                <Route path="/resource-generator" element={<ResourceGenerator />} />

                <Route path="/game/arte-ruim-parser" element={<ArteRuimParser />} />
                <Route path="/game/arte-ruim-groups" element={<ArteRuimGroups />} />
                <Route path="/game/crimes-hediondos-categorizer" element={<CrimesHediondosCategorizer />} />
                <Route path="/game/daily-setup" element={<DailySetup />} />

                <Route path="/images/image-cards" element={<ImagesImageCards />} />
                <Route path="/images/suspects" element={<ImagesSuspects />} />
                <Route path="/images/alien-items" element={<ImagesAlienItems />} />
                <Route path="/images/weapons" element={<ImagesCrimeWeapons />} />
                <Route path="/images/evidence" element={<ImagesCrimeEvidence />} />

                <Route path="/single-words" element={<SingleWordsExpander />} />
                <Route path="/other" element={<Other />} />
              </Routes>
            </HashRouter>
          </AuthWrapper>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
