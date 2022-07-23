import { HashRouter, Route, Routes } from 'react-router-dom';

import { Home } from './pages/Home';
import { ArteRuimParser } from './pages/ArteRuimParser';
import { ArteRuimGroups } from './pages/ArteRuimGroups';
import { Other } from './pages/Other';
import { Resource } from './pages/Resource';

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
