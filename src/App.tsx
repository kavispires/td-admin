import { HashRouter, Route, Routes } from 'react-router-dom';

import { Home } from 'pages/Home';
import { ArteRuimParser } from 'pages/ArteRuimParser';
import { ArteRuimGroups } from 'pages/ArteRuimGroups';
import { Other } from 'pages/Other';
import { Resource } from 'pages/Resource';
import { ConfigProvider } from 'antd';

ConfigProvider.config({
  theme: {
    primaryColor: '#748599',
    errorColor: '#F8C1D4',
    warningColor: '#F3D6BC',
    successColor: '#7FB28A',
    infoColor: '#2a9d8f',
  },
});

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/arte-ruim-parser" element={<ArteRuimParser />} />
          <Route path="/arte-ruim-groups" element={<ArteRuimGroups />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/other" element={<Other />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
