require('babel-core/register');
require('babel-polyfill');

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';

import App from './components/App';
import store from './stores';

import './styles.scss';

render(
    <Provider {...store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
