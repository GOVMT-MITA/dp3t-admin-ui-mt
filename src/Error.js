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

class Error extends Component {

  render() {
    return (
		<Container fluid="md" className="mb-5">
			<Jumbotron className="mt-2">
		<Row>
			<Col md="5" className="ml-md-5">
				<Image src="undraw_cancel_u1it.svg" fluid />
			</Col>
			<Col xs="auto">
				<h1>We have a situation.</h1>
				<p>Something went wrong during the last operation.</p>
				<p>This message could help:</p>
				<p><strong>{this.props.message}</strong></p>
			</Col>
		</Row>
		</Jumbotron>
		</Container>
	);
  }
}

export default Error;
