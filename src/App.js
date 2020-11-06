/*
 * Copyright (c) 2020 Malta Information Technology Agency <https://mita.gov.mt>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
 
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { AzureAD, AuthenticationState } from 'react-aad-msal';

import { Route, Router, NavLink } from 'react-router-dom'
import CovidCodesList from './covidCodesList';
import ExposureConfig from './ExposureConfig';
import Home from './Home';
import Unauthorised from './Unauthorised';
import Error from './Error';

const history = require("history").createBrowserHistory();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

    console.log("DP3T Admin UI started");
  
  }
  
 
  render() {
    const { logout, authenticationState, accountInfo, error } = this.props;
	console.log(error);
	if (error) {
		return (
		  <Error message={error.errorMessage}/>
		)
	} else {
		return (
		<Router history={history}>
			<Navbar id="header-navbar" bg="dark" variant="dark" expand="md">
				<Container fluid="md">
					<Navbar.Brand href="#home">CovidAlert Malta</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<NavLink exact={true} className="nav-link" to="/">Home</NavLink>
							<NavLink className="nav-link" to="/covid-codes">CovidCodes</NavLink>
							<NavLink exact={true} className="nav-link" to="/exposure-config">Exposure Configuration</NavLink>
						</Nav>
						<Nav className="ml-auto">
							<AuthenticationInfo logout={logout} authenticationState={authenticationState} accountInfo={accountInfo}/>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<div style={{marginBottom: "200px"}}>
				<Route exact path="/" component={Home} />
				<Route path="/covid-codes" component={CovidCodesList}/>				
				<Route exact path="/exposure-config" component={ExposureConfig} />
				<Route exact path="/unauthorised" component={Unauthorised} />
			</div>
			<footer className="footer bg-light">
				<div className="container">	
					<nav className="navbar navbar-light navbar-expand-md justify-content-center">
						<ul className="navbar-nav w-100 mr-auto">
							<a href="http://www.gov.mt" target="_blank">
								<img border="0" src="gov-mt-logo.png" alt="gov.mt logo" id="gov_img"/>
							</a>
						</ul>
						<ul className="navbar-nav w-100 justify-content-center">
							<li className="nav-item">
								<a className="nav-link" href="/about">About</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="/terms-of-use">Terms of Use</a>
							</li>
						</ul>
						<ul className="nav navbar-nav ml-auto w-100 justify-content-end">
								<a className="nav-link p-0" href="http://mita.gov.mt" target="_blank"> 
									<img border="0" src="mita_logo_small_new.png" alt="MITA Logo" id="mita_img"/>
								</a>		                    
						</ul>
					</nav>
				</div>
			</footer>		

		</Router>
		)
	}
	
  }

}

function AuthenticationInfo(props) {
	switch (props.authenticationState) {
        case AuthenticationState.Authenticated:
          	return (
				<React.Fragment>
					<Navbar.Text>Logged in as</Navbar.Text>
					<NavDropdown title={props.accountInfo.account.name}>
						<NavDropdown.Item href="#" onClick={props.logout}>Logout</NavDropdown.Item>
					</NavDropdown>
				</React.Fragment>
				);
        case AuthenticationState.Unauthenticated:
          return (<Navbar.Text>You are not logged in</Navbar.Text>);
        case AuthenticationState.InProgress:
          return (<Navbar.Text>Authenticating...</Navbar.Text>);
      }
}

export default App;
