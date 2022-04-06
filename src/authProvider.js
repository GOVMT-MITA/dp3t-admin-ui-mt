/*
 * Copyright (c) 2020 Malta Information Technology Agency <https://mita.gov.mt>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
 
import { MsalAuthProvider, LoginType } from 'react-aad-msal';
 
const apiConfig = {
  b2cScopes: ["https://b2cdevgovmt.onmicrosoft.com/MITA-CovidMalta/userimpersonation"],
  webApi: "http://localhost:8080"
};

const b2cPolicies = {
  names: {
      signUpSignIn: "b2c_1a_dev_mita_corp_extended_signin"
  },
  authorities: {
      signUpSignIn: {
          authority: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_SIGNIN_AUTHORITY : "https://b2cdevgovmt.b2clogin.com/b2cdevgovmt.onmicrosoft.com/b2c_1a_dev_mita_corp_extended_signin",
      }
  },
}

// Msal Configurations
const config = {
  auth: {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    clientId: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_SIGNIN_CLIENT_ID : '4e176853-7f37-4520-987f-d72fabcd7af8',
    validateAuthority: false,
    redirectUri: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_AUTH_REDIRECT_URL : 'http://localhost:3000'
    
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
};

const loginRequest = {
  scopes: ["openid", "profile"],
};

const tokenRequest = {
  scopes: apiConfig.b2cScopes,
};
 
// Options
const options = {
	loginType: LoginType.Redirect,
    tokenRefreshUri: window.location.origin + '/auth.html'
}

export const authProvider = new MsalAuthProvider(config, tokenRequest, options)