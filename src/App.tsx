import { App as AntApp, ConfigProvider, theme } from 'antd';
import { AuthWrapper } from 'components/Layout';
import { ArteRuimGroups } from 'pages/ArteRuimGroups';
import { ArteRuimParser } from 'pages/ArteRuimParser';
import { CrimesHediondosCategorizer } from 'pages/CrimesHediondosCategorizer';
import { DailySetup } from 'pages/DailySetup';
import { Home } from 'pages/Home';
import { Items } from 'pages/Images/Items';
import { CrimeEvidence } from 'pages/Images/CrimeEvidence';
import { CrimeWeapons } from 'pages/Images/CrimeWeapons';
import { ImageCards } from 'pages/Images/ImageCards';
import { Sprites } from 'pages/Images/Sprites';
import { Suspects } from 'pages/Images/Suspects';
import { Other } from 'pages/Other';
import { Resource } from 'pages/Resource';
import { ResourceGenerator } from 'pages/ResourceGenerator';
import { SingleWordsExpander } from 'pages/SingleWordsExpander';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ImageCardsRelationships } from 'pages/Images/ImageCardsRelationships';
import { ImageCardsConnections } from 'pages/Images/ImageCardsConnections';

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

                <Route path="/image-cards">
                  <Route path="decks" element={<ImageCards />} />
                  <Route path="relationships" element={<ImageCardsRelationships />} />
                  <Route path="connections" element={<ImageCardsConnections />} />
                </Route>

                <Route path="/items">
                  <Route path="" element={<Items />} />
                  <Route path="listing" element={<Items />} />
                  <Route path="attributes" element={<Items />} />
                  <Route path="crime" element={<Items />} />
                </Route>

                <Route path="/images">
                  <Route path="suspects" element={<Suspects />} />
                  <Route path="weapons" element={<CrimeWeapons />} />
                  <Route path="evidence" element={<CrimeEvidence />} />
                  <Route path="sprites" element={<Sprites />} />
                </Route>

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
