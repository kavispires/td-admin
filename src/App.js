import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './routes/Home';
import Parser from './routes/Parser';
import Level4 from './routes/Level4';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/parser" component={Parser} />
          <Route path="/level4" component={Level4} />
          <Route path="/" exact component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
