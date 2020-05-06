'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import CorrTable from './table';
import Request from './request/request';
import Clients from './clients';
import Laws from './laws';
import corrStore from './store';

class Correspondence extends React.Component {
  state = {
    view: 'request' // table, request, clients, laws
  };

  componentDidMount() {
    window.requests ? (corrStore.requests = window.requests) : [];
    corrStore.laws = window.laws;
    corrStore.clients = window.clients;
    corrStore.employees = window.employees;
  }

  changeView = (e, name) => {
    e.preventDefault();
    this.setState({view: name});
  };

  showRequest = () => {
    this.setState({view: 'request'});
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) {
      return 'btn btn-sm btn-secondary active';
    }
    return 'btn btn-sm btn-secondary';
  };

  render() {
    const {view} = this.state;
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
            <CorrTable showRequest={this.showRequest} />
          </When>
          <When condition={view === 'request'}>
            <Request close={this.changeView} />
          </When>
          <When condition={view === 'clients'}>
            <Clients />
          </When>
          <When condition={view === 'laws'}>
            <Laws />
          </When>
        </Choose>
      </>
    );
  }
}

ReactDOM.render(<Correspondence />, document.getElementById('correspondence'));
