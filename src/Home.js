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
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

class Home extends Component {

  render() {
    return (
		<Container fluid="md" className="mb-5">
			<Jumbotron className="mt-2">
			<Row>
				<Col md="5" className="ml-md-5">
					<Image src="undraw_doctors_hwty.svg" fluid />
				</Col>
				<Col xs="auto">
					<h1>CovidAlert Malta Administration</h1>
					<p>Please use the navigation bar above to access the desired functionality</p>
				</Col>
			</Row>
			</Jumbotron>
		</Container>
	);
  }
}

export default Home;
