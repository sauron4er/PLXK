'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import CorrTable from './corr_table';
import Request from "./request/request";
import Clients from './clients';
import Laws from './laws';
import corrStore from "./store";

class Correspondence extends React.Component {
  state = {
    view: 'laws', // table, request, clients, laws
    requests: window.requests,
    request: {},
    clients: window.clients,
    laws: window.laws,
  };

  componentDidMount() {
    corrStore.requests = window.requests;
    corrStore.laws = window.laws;
    corrStore.clients = window.clients;
  }

  changeView = (e, name) => {
    e.preventDefault();
    this.setState({
      view: name
    });
  };

  showRequest = (request) => {
    if (request) {
      this.setState({
        view: 'request',
        request: request
      })
    }
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) {
      return 'btn btn-sm btn-secondary active';
    }
    return 'btn btn-sm btn-secondary';
  };

  changeListFromChild = (name, new_list) => {
    this.setState({
      [name]: new_list
    });
  };

  render() {
    const {view, requests, request, clients, laws} = this.state;
    return (
      <>
        <div className='btn-group mb-2' role='group' aria-label='Basic example'>
          <button
            type='button'
            className={this.getButtonStyle('table')}
            onClick={(e) => this.changeView(e, 'table')}
          >
            Запити
          </button>
          <button
            type='button'
            className={this.getButtonStyle('clients')}
            onClick={(e) => this.changeView(e, 'clients')}
          >
            Клієнти
          </button>
          <button
            type='button'
            className={this.getButtonStyle('laws')}
            onClick={(e) => this.changeView(e, 'laws')}
          >
            Законодавство
          </button>
        </div>

        <Choose>
          <When condition={view === 'table'}>
            <CorrTable requests={requests} showRequest={this.showRequest} />
          </When>
          <When condition={view === 'request'}>
            <Request close={this.changeView} />
          </When>
          <When condition={view === 'clients'}>
            <Clients clients={clients} changeList={this.changeListFromChild} />
          </When>
          <When condition={view === 'laws'}>
            <Laws laws={laws} changeList={this.changeListFromChild} />
          </When>
        </Choose>
      </>
    );
  }
}

ReactDOM.render(<Correspondence />, document.getElementById('correspondence'));
