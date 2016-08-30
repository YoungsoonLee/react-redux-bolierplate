import React from 'react';
import ReactDOM from 'react-dom';
// Router
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

// Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware , compose ,combineReducers } from 'redux';
import reducers from 'reducers';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

// Container Components
import { App , Home , Login , Register , Wall } from 'containers';
//import ClientRoutes from './clientRoutes.js';

/*
const freducers = {
  // ... your other reducers here ...
  reducers,
  form: formReducer     // <---- Mounted at 'form'. See note below.
}
const reducer = combineReducers(freducers);
*/

/* todo : only logging in development */
const logger = createLogger();
const store = createStore(
  //reducer,
  reducers,
  //applyMiddleware(thunk, promise,logger)
  applyMiddleware(thunk, promise)
);

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
              <IndexRoute component={Home}/>
              <Route path="home" component={Home}/>
              <Route path="login" component={Login}/>
              <Route path="register" component={Register}/>
              <Route path="wall/:username" component={Wall}/>
            </Route>
        </Router>
    </Provider>, rootElement
);
