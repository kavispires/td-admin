import { HashRouter, Route, Routes } from 'react-router-dom';

import Home from './routes/Home';
import Parser from './routes/arte-ruim/Parser';
import Level4 from './routes/arte-ruim/Level4';
import Other from './routes/Other';
import Resource from './routes/Resource';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/arte-ruim/parser" element={<Parser />} />
          <Route path="/arte-ruim/level4" element={<Level4 />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/other" element={<Other />} />
          <Route path="/" exact element={<Home />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
