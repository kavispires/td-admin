import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './routes/Home';
import Parser from './routes/arte-ruim/Parser';
import Level4 from './routes/arte-ruim/Level4';
import Other from './routes/Other';
import Resource from './routes/Resource';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/arte-ruim/parser" component={Parser} />
          <Route path="/arte-ruim/level4" component={Level4} />
          <Route path="/resource" component={Resource} />
          <Route path="/other" component={Other} />
          <Route path="/" exact component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
