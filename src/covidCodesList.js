/*
 * Copyright (c) 2020 Malta Information Technology Agency <https://mita.gov.mt>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
 
import React, { Component, useState } from 'react';
import './App.css';
import Error from './Error';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import Moment from 'react-moment';
import 'moment-timezone';

import { Switch, Route  } from 'react-router-dom'

import NewCovidCode from './newCovidCode'
import CovidCodeDetails from './covidCodeDetails'
import { authProvider } from './authProvider';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

function RevokeButton(props) {

	const [show, setShow] = useState(false);
	const [revoking, setRevoking] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const revokeCovidCode = async id => {
		const urlBase = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_BASE_URL : 'http://localhost:8080';
		const token = await authProvider.getIdToken();
		setRevoking(true);

		fetch(urlBase + "/v1/codes/revoked/" + id, {
            method: "DELETE",
            headers: {
				Authorization: 'Bearer ' + token.idToken.rawIdToken,
                "Content-Type": "application/json",
            }
        })
        .then(
			
			(result) => { 
				if (!result.ok)	{
					if (result.status === 401) {
						props.onRevokeUnauthorised();
					} else {
						result.text().then(message => {
							setShow(false);
							setRevoking(false);
							props.onRevokeFail(message || "Unexpected error");
						})
					}
				} else {
					result.json().then(result => { 
						setShow(false);
						setRevoking(false);
						props.onRevokeSuccess();
					});
				}
			},

            (error) => {
				setShow(false);
				setRevoking(false);
                props.onRevokeFail(error);
            }

		)
	}

	const renderYesButton = () => {
		if (!revoking) {
			return (
				<Button variant="primary" onClick={revokeCovidCode.bind(this, props.covidCode.id)}>Yes, revoke it</Button>
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
					&nbsp;Working
			  </Button>
			);
		}
	}

	if (props.covidCode.revoked) {
		return (
			<Button variant="secondary" disabled>
				<i className="fa fa-ban" aria-hidden="true"></i>
			</Button>
		);
	} else {
		return (
			<React.Fragment>
			<Modal show={show} onHide={handleClose}>
  				<Modal.Header closeButton>
    				<Modal.Title>Confirmation Required</Modal.Title>
  				</Modal.Header>
  				<Modal.Body>
    				<p>Are you sure you want to revoke this code?</p>
					<h3>{props.covidCode.authorisationCodePretty}</h3>
  				</Modal.Body>
  				<Modal.Footer>
    				<Button variant="secondary" onClick={handleClose}>No</Button>
    				{renderYesButton()}
  				</Modal.Footer>
			</Modal>			
			<Button variant="danger" onClick={handleShow}>
				<i className="fa fa-ban" aria-hidden="true"></i>
			</Button>
			</React.Fragment>
		);
	}
}

function CheckedBox(props) {
	if (props.checked)
		return <i className="fa fa-check-square-o" aria-hidden="true"></i>;
	else
		return <i className="fa fa-square-o" aria-hidden="true"></i>
}

class CovidCodesList extends Component {

    constructor(props) {
        super(props);
        this.state = {			
			lastRefresh: new Date(),
			refreshing: false,
            error: null,
            isLoaded: false,
			data: [],
			total: 0,
			filter: {query: "", includeClosed: false, page: 1, pageSize: 10, sort: "specimen_no", order: "ASC"}
          };
		  
    }

    componentDidMount() {
        this.refreshData();
    }

	search() {
		this.refreshData();
	}

	refreshData = async () => {

		const { history } = this.props;

		this.setState({refreshing: true});

		const urlBase = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_BASE_URL : 'http://localhost:8080';
		const token = await authProvider.getIdToken();

		const { query, includeClosed, page, pageSize, sort, order } = this.state.filter;
		
		let url = urlBase + "/v1/codes"
			+ "?start=" + ((page-1)*pageSize)
			+ "&size=" + pageSize
			+ "&sort=" + sort
			+ "&order=" + order
			
		if (query.trim() == "") {
			url += "&all=" + (includeClosed ? "Y" : "N");
		} else {
			url += "&all=Y&q=" + query;
		}

		console.log(url);
		
        return fetch(url, {
            method: "GET",
            headers: {
				Authorization: 'Bearer ' + token.idToken.rawIdToken,
                "Content-Type": "application/json",
            }
        })
		.then(

			(result) => { 
				if (!result.ok)	{
					if (result.status === 401) {
						history.push('/unauthorised');
					} else {
						result.text().then((message) => {
							this.setState({
								isLoaded: false,
								refreshing: false,
								error: message || "Unexpected error"
							});
						})
					}
				} else {
					result.json().then(result => { 
						this.setState({
							isLoaded: true,
							refreshing: false,
							data: result.covidCodes,
							total: result.total,
							lastRefresh: new Date(),
							error: null,
							sidebarOpen: true
						});
					});
				}
			},

            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
					isLoaded: false,
					refreshing: false,
					error
                });
            }
        )
    }
	
	renderCovidCodes = () => {

		const { history } = this.props;
		const { data } = this.state;

		if (data.length === 0) {
			return (
				<tr><td colspan={10}>Nothing to show</td></tr>
			)
		}

        return this.state.data.map((covidCode) => (
            <tr key={covidCode.id}>
				<td>{covidCode.specimenNumber}</td>
				<td><Moment format="LL">{covidCode.receiveDate}</Moment></td>
				<td className="d-none d-md-table-cell"><Moment format="LL">{covidCode.onsetDate}</Moment></td>
				<td className="d-none d-md-table-cell">{covidCode.transmissionRisk}</td>
				<td>{covidCode.authorisationCodePretty}</td>
				<td className="d-none d-md-table-cell"><Moment local>{covidCode.registeredAt}</Moment></td>
				<td className="d-none d-md-table-cell"><Moment fromNow>{covidCode.expiresAt}</Moment></td>
				<td className="d-none d-md-table-cell"><CheckedBox checked={covidCode.revoked}/></td>
				<td className="d-none d-md-table-cell"><CheckedBox checked={covidCode.redeemed}/></td>
				<td width={120}>
					<Button className="mr-1" variant="primary" onClick={() => history.push('/covid-codes/' + covidCode.id)}>
						<i className="fa fa-info-circle" aria-hidden="true"></i>
					</Button>
					<RevokeButton covidCode={covidCode} 
						onRevokeSuccess={this.refreshData} 
						onRevokeFail={(e) => this.setState({error: e})}
						onRevokeUnauthorised={() => history.push('/unauthorised')}
						/>					
				</td>
			</tr>
        ));
    }
	
	setPage(page) {
		const {filter} = this.state;
		let newFilter = {...filter, page: page};
		console.log(JSON.stringify(newFilter));
		this.setState({filter: newFilter}, () => { this.refreshData();});
	}
	
	renderPagination() {
		const { page, pageSize} = this.state.filter;
		let total = this.state.total;
		let batchSize = pageSize;
		
		let numberOfPages = Math.floor(total / batchSize) + ((total % batchSize) > 0 ? 1 : 0);
		let firstPage = page - 2;
		let lastPage = page + 2;
		if (firstPage < 1) {
			firstPage = 1;
			lastPage = firstPage + 4;
		}
		if (lastPage > numberOfPages) {
			lastPage = numberOfPages;
			firstPage = (lastPage - 4) < 1 ? 1 : (lastPage - 4);
		}
		
		let items = [];
		for (let number = firstPage; number <= lastPage; number++) {
			items.push(
				<Pagination.Item key={number} active={number === page} onClick={ this.setPage.bind(this, number)}>
					{number}
				</Pagination.Item>,
			);
		}
		return <Pagination>{items}</Pagination>
	}
	
	setQuery(e) {
		console.log("Setting query to " + e.target.value);
		const {filter} = this.state;
		let newFilter = {...filter, query: e.target.value, page: 1};
		this.setState({filter: newFilter});		
	}

	setIncludeClosed(e) {
		const {filter} = this.state;
		let newFilter = {...filter, includeClosed: e.target.checked, page: 1};
		this.setState({filter: newFilter});		
	}
	
	setSortStatus(col, order) {
		const {filter} = this.state;
		let newFilter = {...filter, sort: col, order: order};
		this.setState({filter: newFilter}, () => { this.refreshData();});
	}

	renderSortStatus(title, col) {
		const { sort, order } = this.state.filter;
		if (col === sort) {
			if (order === "ASC") {
				return (<a href="#" onClick={ this.setSortStatus.bind(this, col, "DESC") }>
							<div style={{display: "inline-block"}}><i className="fa fa-sort-asc" aria-hidden="true"></i></div>
							<div style={{display: "inline-block"}} className="ml-1">{title}</div>
						</a>);
			} else {
				return (<a href="#" onClick={ this.setSortStatus.bind(this, col, "ASC") }>
							<div style={{display: "inline-block"}}><i className="fa fa-sort-desc" aria-hidden="true"></i></div>
							<div style={{display: "inline-block"}} className="ml-1">{title}</div>
						</a>);
			}
		} else {
			return (<a href="#" onClick={ this.setSortStatus.bind(this, col, "ASC") }>
						<div style={{display: "inline-block"}}><i className="fa fa-sort" aria-hidden="true"></i></div>
						<div style={{display: "inline-block"}} className="ml-1">{title}</div>
					</a>);
		}
		
	}
	
	setPageSize(e) {
		const {filter} = this.state;
		let newFilter = {...filter, pageSize: e.target.value};
		this.setState({filter: newFilter}, () => { this.refreshData();});
	}

	renderSearchButton() {
		const { refreshing } = this.state;
		if (!refreshing) {
			return (
				<Button onClick={ this.search.bind(this) }>Search</Button>
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
					&nbsp;Working
			  </Button>
			);
		}
	}

	async downloadCsv() {

		const { history } = this.props;

		this.setState({refreshing: true});

		const urlBase = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_BASE_URL : 'http://localhost:8080';
		const token = await authProvider.getIdToken();

		const { query, includeClosed, page, pageSize, sort, order } = this.state.filter;
		
		let url = urlBase + "/v1/csv"
			+ "?offset=" + new Date().getTimezoneOffset()/60
			
		console.log(url);
		
        return fetch(url, {
            method: "GET",
            headers: {
				Authorization: 'Bearer ' + token.idToken.rawIdToken,
            }
        })
		.then(

			(result) => { 
				if (!result.ok)	{
					if (result.status === 401) {
						history.push('/unauthorised');
					} else {
						result.text().then((message) => {
							this.setState({
								isLoaded: false,
								refreshing: false,
								error: message || "Unexpected error"
							});
						})
					}
				} else {
					const filename = "CovidCodes.csv";
					if (result.headers.has('Content-Disposition')) {
					  filename = result.headers.get('Content-Disposition')
						.split(';')
						.find(n => n.includes('filename='))
						.replace('filename=', '')
						.trim();
					}
					result.blob().then(blob => {
						var url = window.URL.createObjectURL(blob);
						var a = document.createElement('a');
						a.href = url;
						a.download = "" + filename;
						document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
						a.click();    
						a.remove();  //afterwards we remove the element again    
						this.setState({
							isLoaded: true,
							refreshing: false
						});
					});
				}
			},

            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
					isLoaded: false,
					refreshing: false,
					error
                });
            }
        )
	
	}
	
	browseCovidCodes = () => {
		const { history } = this.props;
		const { isLoaded, refreshing } = this.state;
		return (
			<React.Fragment>
				<Navbar bg="light" expand="md">
					<Container fluid="md">
						<Nav.Item className="mr-1 d-none d-md-inline-block">
							<Button onClick={() => { history.push('/covid-codes/new'); }}>New</Button>
						</Nav.Item>
						<Nav.Item className="w-100 d-none d-md-inline-block">
							<Button onClick={ this.downloadCsv.bind(this) }>Download CSV</Button>
						</Nav.Item>
						<Nav.Item className="w-100">
							<Form>
								<Form.Row className="justify-content-end">
									<Col md="3" xs="12">
										<Form.Check type="checkbox" label="Inc. Closed" onChange={e =>  this.setIncludeClosed(e) }/>
									</Col>
									<Col md="6" xs="7">
										<FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={e =>  this.setQuery(e) }/>
									</Col>
									<Col md="3" xs="5">
										{this.renderSearchButton()}
									</Col>
								</Form.Row>
							</Form>
						</Nav.Item>
					</Container>
				</Navbar>	
				<Container fluid="md" className="mb-5">
					<Row className="mt-3">
						<Table responsive striped hover>
							<thead>
								<tr>
									<th className="nces-sortable-col">{ this.renderSortStatus("Case Number Code","specimen_no") }</th>
									<th className="nces-sortable-col">{ this.renderSortStatus("Isolation Start Date","receive_date") }</th>
									<th className="nces-sortable-col d-none d-md-table-cell">{ this.renderSortStatus("Infec. Onset Date", "onset_date") }</th>
									<th className="d-none d-md-table-cell">Risk Level</th>
									<th style={{minWidth: "150px"}}>Auth. Code</th>
									<th className="nces-sortable-col d-none d-md-table-cell">{ this.renderSortStatus("Registered","registered_at") }</th>
									<th className="nces-sortable-col d-none d-md-table-cell">{ this.renderSortStatus("Expires","expires_at") }</th>
									<th className="d-none d-md-table-cell">Revoked</th>
									<th className="d-none d-md-table-cell">Redeemed</th>
									<th style={{minWidth: "120px"}}>#</th>
								</tr>
							</thead>
							<BlockUi tag="tbody" blocking={!isLoaded || refreshing}>
								{ this.renderCovidCodes() }
							</BlockUi>
						</Table>
					</Row>
					<Row className="mt-3">
						<Col md="4" xs="6">
							<Form inline>
								<Form.Row>
									<Form.Group as={Col} controlId="formGridState">
										<Form.Label className="d-none d-md-inline-block">Show every:</Form.Label>
										<Form.Control as="select" defaultValue="10" className="ml-1" onChange={e => this.setPageSize(e) }>
											<option>10</option>
											<option>25</option>
											<option>50</option>
											<option>100</option>
										</Form.Control>
									</Form.Group>
								</Form.Row>
							</Form>
						</Col>
						<Col md="4" xs="6">
							<span className="w-100 d-flex justify-content-end justify-content-md-center">
								{ this.renderPagination() }
							</span>
						</Col>
						<Col md="4" xs="12">
							<span className="w-100 d-flex justify-content-end">
								Last refreshed on <Badge variant="primary" size="small"><Moment format="DD-MM-YY HH:mm:ss" date={this.state.lastRefresh} /></Badge>
							</span>
						</Col>
					</Row>
				</Container>
				<span className="fixed-bottom d-flex justify-content-end d-md-none" style={{zIndex: 5000, right: "15px", bottom: "100px"}}>
					<Button className="btn-circle btn-lg" onClick={() => { history.push('/covid-codes/new'); }}><i className="fa fa-plus" aria-hidden="true"></i></Button>
				</span>
			</React.Fragment>
		)
		
	}
	
    render() {
        const { error } = this.state;
        const { match } = this.props;

        if (error) {
            return <Error message={error.message || error}/>;
        } else {
            return (
				<Switch>
					<Route exact path={`${match.url}/`} component={this.browseCovidCodes}/>
					<Route exact path={`${match.url}/new`}>
						<NewCovidCode onRegistration={this.refreshData}/>
					</Route>
					<Route path={`${match.url}/:id`}>
						<CovidCodeDetails/>
					</Route>
				</Switch>
				
            );
          }    
    }

}

export default CovidCodesList;

