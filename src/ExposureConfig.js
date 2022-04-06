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
import './App.css';
import Error from './Error';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Moment from 'react-moment';
import 'moment-timezone';
import { withRouter } from "react-router";
import { authProvider } from './authProvider';
import BlockUi from 'react-block-ui';

class ExposureConfig extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
			data: []
          };
    }

    componentDidMount() {
        this.loadConfig();
	}
	
    loadConfig = async () => {
		const { history } = this.props;
		const urlBase = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_CONFIG_BASE_URL : 'http://localhost:8080';
		const token = await authProvider.getIdToken();

		let url = urlBase + "/v1/config?appversion=XXX&osversion=XXX&buildnr=XXX"
		
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
		})
        .then(
            (result) => {
				if (!result.ok)	{
					if (result.status === 401) {
						history.push('/unauthorised');
					} else {
						result.text().then(message => {
							this.setState({
								isLoaded: false,
								error: message || "Unexpected error"
							});
						})		
					}
				} else {
					result.json().then(result => {
						this.setState({
							isLoaded: true,
							data: result,
							error: null
						});		
					})
				}	
			},
			
            (error) => {
                this.setState({
					isLoaded: false,
					error
                });
            }
        )
    }	

	render() {
		const { error, isLoaded, data } = this.state;

        if (error) {
            return <Error message={error.message || error}/>;
        } else {
			return (
				<BlockUi tag="div" blocking={!isLoaded}>
					<Container fluid="md">
					<h3 className="mt-3">Exposure Notifications Configuration</h3>
					<h4 className="mt-3">Android</h4>
					<SdkConfig config={data.androidGaenSdkConfig || {}}/>
					<h4 className="mt-3">iOS</h4>
					<SdkConfig config={data.iOSGaenSdkConfig || {}}/>
					</Container>
				</BlockUi>
			);
		}
	}

}

function SdkConfig(props) {

	return (
		<Form className="mt-3">
			<Form.Group as={Row} controlId="attenuationThresholdLow">
				<Form.Label column sm="3">
					Attenuation Threshold Low
				</Form.Label>
				<Col sm="9">
					<Form.Control disabled placeholder="Attenuation Threshold Low" defaultValue={ props.config.lowerThreshold } />
				</Col>
			</Form.Group>
			<Form.Group as={Row} controlId="attenuationThresholdHigh">
				<Form.Label column sm="3">
					Attenuation Threshold High
				</Form.Label>
				<Col sm="9">
					<Form.Control disabled placeholder="Attenuation Threshold High" defaultValue={ props.config.higherThreshold } />
				</Col>
			</Form.Group>
			<Form.Group as={Row} controlId="attenuationThresholdLowFactor">
				<Form.Label column sm="3">
					Attenuation Threshold Low Factor
				</Form.Label>
				<Col sm="9">
					<Form.Control disabled placeholder="Attenuation Threshold Low Factor" defaultValue={ props.config.factorLow } />
				</Col>
			</Form.Group>
			<Form.Group as={Row} controlId="attenuationThresholdHighFactor">
				<Form.Label column sm="3">
					Attenuation Threshold High Factor
				</Form.Label>
				<Col sm="9">
					<Form.Control disabled placeholder="Attenuation Threshold High Factor" defaultValue={ props.config.factorHigh } />
				</Col>
			</Form.Group>
			<Form.Group as={Row} controlId="triggerThreshold">
				<Form.Label column sm="3">
					Minimum Duration for Exposure
				</Form.Label>
				<Col sm="9">
					<Form.Control disabled placeholder="Minimum Duration for Exposure" defaultValue={ props.config.triggerThreshold } />
				</Col>
			</Form.Group>
		</Form>

	);
}

export default withRouter(ExposureConfig);

