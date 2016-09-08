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

// DO NOT USE REDUX-LOGGER IN PRODUCTION ENV
let middleware = [thunk];

// DO NOT USE REDUX-LOGGER IN PRODUCTION ENV
if (process.env.NODE_ENV !== 'production') {
    const createLogger = require('redux-logger');
    const logger = createLogger();
    middleware = [...middleware, logger];
}

const store = createStore(
    reducers,
    applyMiddleware(...middleware)
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
