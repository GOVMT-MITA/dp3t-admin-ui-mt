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

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import moment from 'moment/moment.js'
import 'moment-timezone';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, {
	formatDate,
	parseDate,
  } from 'react-day-picker/moment';
  
import 'moment/locale/en-gb';
import 'react-day-picker/lib/style.css';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { authProvider } from './authProvider';

import { withRouter } from "react-router";

class NewCovidCode extends Component {

	initState = {
		covidCode: {specimenNumber: "", receiveDate: "", onsetDate: "", transmissionRisk: "0"}, 
		validation: {
			specimenNumber: {wasInvalid: false, valid: true, message: "Seems fine"},
			receiveDate: {wasInvalid: false, valid: true, message: "Seems fine"},
			onsetDate: {wasInvalid: false, valid: true, message: "Seems fine"}
		},
		modal: {show: false},
		saving: false,
		error: null
	}

    constructor(props) {
		super(props);
		this.state = this.initState;
	}

	resetState() {
		this.setState({
			covidCode: {specimenNumber: "", receiveDate: "", onsetDate: "", transmissionRisk: "0"}, 
			validation: {
				specimenNumber: {wasInvalid: false, valid: true, message: "Seems fine"},
				receiveDate: {wasInvalid: false, valid: true, message: "Seems fine"},
				onsetDate: {wasInvalid: false, valid: true, message: "Seems fine"}
			},
			modal: {show: false},
			saving: false,
			error: null
		});
	}
	

	saveCovidCode = async c => {

		const { history } = this.props;
		
		const token = await authProvider.getIdToken();
		console.log(token);

		const urlBase = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_BASE_URL : "http://localhost:8080";

		this.setState({saving: true});


		fetch(urlBase + "/v1/codes", {
			method: "POST",
			headers: {
				Authorization: 'Bearer ' + token.idToken.rawIdToken,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(c)
		})
		.then(result => {
			if (!result.ok)	{
				if (result.status === 401) {
					history.push('/unauthorised');
				} else {
					result.text().then(message => {
						this.setState({error: message || "Unexpected error", saving: false});					
					})
				}
			} else {
				result.json().then(result => { 
					this.setState(
						{
							error: null,
							saving: false,
							modal: {show: true, 
								title: "New CovidCode", 
								body: "CovidCode registered successfully with authorisation code " + result.authorisationCodePretty, 
								handleViewDetails: async () => {
									await this.props.onRegistration();
									this.props.history.push('/covid-codes/' + result.id);
								},
								handleRegisterAnother: () => {
									console.log("Register another CovidCode");
									this.resetState();
								},
								handleClose: async () => { 
									await this.props.onRegistration();
									this.props.history.push('/covid-codes');
								}
							}
						})
				})
			}
		})
		.catch(error => {
			this.setState({error: error.message, saving: false});
		});

	}

	handleChange(e) {
		const id = e.target.id;
		const {covidCode, validation} = this.state;
      	covidCode[id] = e.target.value;
	  	this.setState({covidCode: covidCode}, 
			() => {
				if (validation[id] && validation[id].wasInvalid) {
					this.validateForm();
				}
			});
	  
    };
	
	handleDayChange = (id, selectedDay, modifiers, dayPickerInput) => {
		const {covidCode, validation} = this.state;
		covidCode[id] = moment(selectedDay).format("YYYY-MM-DD");
		this.setState({covidCode: covidCode}, 
			() => {
				if (validation[id].wasInvalid) {
					this.validateForm();
				}
			});
	}

	setShow(modal) {
		this.setState({modal: modal}); 
	}
	
	maybeRenderFeedback(v) {
		if (!v.valid) 
			return (<div className="invalid-feedback d-block">{v.message}</div>)
		else
			if (v.wasInvalid)
				return (<div className="valid-feedback d-block">{v.message}</div>)
			else
				return <div/>

	}

	validateForm() {
		let valid = true;
		const {covidCode, validation} = this.state;
		var pattern=/^([A-Z]){2}([0-9]){6}([A-Z]){1}$/;
		let newValidation = {...validation};		
	    if (!pattern.test(covidCode.specimenNumber)) {
			valid = false;
			newValidation.specimenNumber = {wasInvalid: true, valid: false, message: "Invalid format"};
		} else {
			newValidation.specimenNumber = {...validation.specimenNumber, valid: true, message: "Seems fine now"};
		}
		this.setState({validation: newValidation});

		// Validate receive and onset dates
		let receiveDate = moment(covidCode.receiveDate);
		let onsetDate = moment(covidCode.onsetDate);
		let today = moment().endOf();
		// receive date
		let receiveDateValid=true;
		if (covidCode.receiveDate === "") {
			receiveDateValid = false;
			newValidation.receiveDate = {wasInvalid: true, valid: false, message: "Isolation start date is mandatory"};
		}
		if (receiveDate.isAfter(today)) {
			receiveDateValid = false;
			newValidation.receiveDate = {wasInvalid: true, valid: false, message: "Cannot be in the future"};
		} 
		if (receiveDateValid) {
			newValidation.receiveDate = {...validation.receiveDate, valid: true, message: "Seems fine now"};
		} else {
			valid = false;
		}
		// onset date
		let onsetDateValid=true;
		if (covidCode.onsetDate === "") {
			onsetDateValid = false;
			newValidation.onsetDate = {wasInvalid: true, valid: false, message: "Infectivity onset date is mandatory"};
		}
		if (onsetDate.isAfter(today)) {
			onsetDateValid = false;
			newValidation.onsetDate = {wasInvalid: true, valid: false, message: "Infectivity onset date cannot be in the future"};
		}
		if (onsetDate.isAfter(receiveDate)) {
			onsetDateValid = false;
			newValidation.onsetDate = {wasInvalid: true, valid: false, message: "Infectivity onset date cannot be after isolation start date"};
		}
		if (onsetDateValid) {
			newValidation.onsetDate = {...validation.onsetDate, valid: true, message: "Seems fine now"};
		} else {
			valid = false;
		}
		
		return valid;
	}

	renderAlert() {
		const { error } = this.state;
		if (error) {
			return (
				<Alert className="mt-3" variant="danger" dismissible onClose={() => this.setState({error: null})}>
    				Last operation failed with message <strong>{ this.state.error }</strong>. Please retry later or contact support.
  				</Alert>
			);
		}
	}
	
	renderSaveSuccess() {
		const { modal } = this.state;
		if (modal.show) {
			return (
				<Modal show={modal.show} onHide={modal.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>{modal.title}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{modal.body}</Modal.Body>
					<Modal.Footer>
						<Button variant="primary" onClick={modal.handleViewDetails}>
							View CovidCode details
						</Button>
						<Button variant="info" onClick={modal.handleRegisterAnother}>
							Register another
						</Button>
						<Button variant="secondary" onClick={modal.handleClose}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
			);
		}
	}

	renderRegisterButton() {
		const { saving } = this.state;
		if (!saving) {
			return (
				<Button variant="primary" onClick={e => { if (this.validateForm()) this.saveCovidCode(this.state.covidCode)}}>
					Register
				</Button>				
			);
		} else {
			return (
				<Button variant="primary" disabled>
				<Spinner
					  as="span"
					  animation="border"
					  size="sm"
					  role="status"
					  aria-hidden="true"/>
				&nbsp;Saving...
			  </Button>
			);
		}
	}

	render() {
		const {validation, modal} = this.state;

		return (
			<Container fluid="md" className="mb-5">
				{ this.renderAlert() }
				{ this.renderSaveSuccess() }
				<h3 className="mt-3">New CovidCode Registration</h3>				
				<Form className="mt-3">
					<Form.Group as={Row} controlId="specimenNumber">
						<Form.Label column sm="2">
							Case Number Code
						</Form.Label>
						<Col sm="10">
							<Form.Control placeholder="e.g. CM012345C" 
								value={this.state.covidCode.specimenNumber}
								onChange={e => this.handleChange(e)}
								autoComplete="off"
								isInvalid={!validation.specimenNumber.valid}
								isValid={validation.specimenNumber.wasInvalid ? validation.specimenNumber.valid : null}/>
							<Form.Control.Feedback type={validation.specimenNumber.valid ? "valid" : "invalid"}>{validation.specimenNumber.message}</Form.Control.Feedback>
						</Col>
					</Form.Group>
					<Form.Group as={Row} controlId="receiveDate">
						<Form.Label column sm="2">
							Isolation start date
						</Form.Label>
						<Col sm="10">
							<DayPickerInput 
							    component={props => <InputGroup>
								                       <Form.Control {...props}/>
														<InputGroup.Append>
															<OverlayTrigger
																trigger="click"
																key="left"
																placement="left"
																overlay={
																	<Popover id={`onset-date-popover`}>
																		<Popover.Title as="h3">Isolation start date</Popover.Title>
																		<Popover.Content>
																			The date on which the sample was received by the laboratory to be tested
																			for COVID-19 and patient was advised to isolate.
																		</Popover.Content>
																	</Popover>
																	}>
																<Button variant="secondary">
																	<i className="fa fa-info-circle" aria-hidden="true"></i>
																</Button>																
															</OverlayTrigger>														
														</InputGroup.Append>
													</InputGroup>}
								onDayChange={(s,m,d) => this.handleDayChange("receiveDate",s,m,d)} 
								format="L"
								formatDate={formatDate}
								parseDate={parseDate}
								placeholder={`${formatDate(new Date(), 'L', 'en-gb')}`}
								value={this.state.covidCode.receiveDate}
        						dayPickerProps={{
          							locale: 'en-gb',
          							localeUtils: MomentLocaleUtils,
        						}}
								inputProps={{id: "receiveDate", 
									className: (validation.receiveDate.valid ? "form-control " + (validation.receiveDate.wasInvalid ? " is-valid" : "") : "form-control is-invalid"), 
									autoComplete: "off"}}/>
							{this.maybeRenderFeedback(validation.receiveDate)}
						</Col>
					</Form.Group>
					<Form.Group as={Row} controlId="onsetDate">
						<Form.Label column sm="2">
							Infectivity onset date
						</Form.Label>
						<Col sm="10">
							
							<DayPickerInput 
							    component={props => <InputGroup>
								                       <Form.Control {...props}/>
														<InputGroup.Append>
															<OverlayTrigger
																trigger="click"
																key="left"
																placement="left"
																overlay={
																	<Popover id={`onset-date-popover`}>
																		<Popover.Title as="h3">Infectivity Onset Date</Popover.Title>
																		<Popover.Content>
																			The date on which it is estimated the patient became infectious.
																			Only the infected keys from this date onwards will be uploaded and
																			disseminated to other users of the App.
																		</Popover.Content>
																	</Popover>
																	}>
																<Button variant="secondary">
																	<i className="fa fa-info-circle" aria-hidden="true"></i>
																</Button>																
															</OverlayTrigger>														
														</InputGroup.Append>
													</InputGroup>}
								onDayChange={(s,m,d) => this.handleDayChange("onsetDate",s,m,d)} 
								format="L"
								formatDate={formatDate}
								parseDate={parseDate}
								placeholder={`${formatDate(new Date(), 'L', 'en-gb')}`}
								value={this.state.covidCode.onsetDate}
        						dayPickerProps={{
          							locale: 'en-gb',
          							localeUtils: MomentLocaleUtils,
        						}}
								inputProps={{id: "onsetDate", 
									className: (validation.onsetDate.valid ? "form-control " + (validation.onsetDate.wasInvalid ? " is-valid" : "") : "form-control is-invalid"), 
									autoComplete: "off"}}/>
								{this.maybeRenderFeedback(validation.onsetDate)}
						</Col>
					</Form.Group>
					{/*
					<Form.Group as={Row} controlId="transmissionRisk">
						<Form.Label column sm="2">
							Transmission Risk Level
						</Form.Label>
						<Col sm="10">
							<Form.Control as="select" defaultValue="0" onChange={e => this.handleChange(e) }>
								<option value="0">0 - Unused</option>
								<option value="1">1 - Confirmed test - Low transmission risk level</option>
								<option value="2">2 - Confirmed test - Standard transmission risk level</option>
								<option value="3">3 - Confirmed test - High transmission risk level</option>
								<option value="4">4 - Confirmed clinical diagnosis</option>
								<option value="5">5 - Self report</option>
								<option value="6">6 - Negative case</option>
								<option value="7">7 - Recursive case</option>
								<option value="8">8 - Unused/custom</option>
							</Form.Control>

						</Col>
					</Form.Group>
					 */}
					<Form.Group as={Row}>
						<Col>								
							{this.renderRegisterButton()}
							<Button variant="secondary" className="ml-2" onClick={e => this.props.history.push('/covid-codes')}>
								Cancel
							</Button>
						</Col>
					</Form.Group>
				</Form>
			</Container>
		);
	}

}

export default withRouter(NewCovidCode);

