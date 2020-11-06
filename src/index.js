/*
 * Copyright (c) 2020 Malta Information Technology Agency <https://mita.gov.mt>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
 
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'normalize.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AzureAD } from 'react-aad-msal';
import { authProvider } from './authProvider';

// Importing the Bootstrap CSS
//import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
	<AzureAD provider={authProvider} forceLogin={true}>
{
    ({login, logout, authenticationState, error, accountInfo}) => {
          return (
            <React.StrictMode>
              <App login={login} logout={logout} authenticationState={authenticationState} accountInfo={accountInfo} error={error}/>
            </React.StrictMode>
                );
    }
  }
	</AzureAD>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
