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
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';

class Unauthorised extends Component {

  render() {
    return (
		<Container fluid="md" className="mb-5">
			<Jumbotron className="mt-2">
		<Row>
			<Col md="5" className="ml-md-5">
				<Image src="undraw_access_denied_6w73.svg" fluid />
			</Col>
			<Col xs="auto">
				<h1>tsk tsk</h1>
				<p>You are not authorised to perform this operation.</p>
			</Col>
		</Row>
		</Jumbotron>
		</Container>
	);
  }
}

export default Unauthorised;
