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
    view: 'table' // table, request, clients, laws
  };

  componentDidMount() {
    corrStore.requests = window.requests;
    corrStore.laws = window.laws;
    corrStore.clients = window.clients;
    corrStore.products = window.products;
    corrStore.employees = window.employees;

    // Визначаємо, чи відкриваємо просто список, чи це конкретне посилання:
    const arr = window.location.pathname.split('/');
    let filtered = arr.filter(el => el !== '');
    const last_href_piece = parseInt(filtered[filtered.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) this.showRequest(last_href_piece);
  }

  changeView = (name) => {
    this.setState({view: name});
  };

  showRequest = (id) => {
    corrStore.request.id = id;
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
            onClick={() => this.changeView('table')}
          >
            Запити
          </button>
          <button
            type='button'
            className={this.getButtonStyle('clients')}
            onClick={() => this.changeView('clients')}
          >
            Клієнти
          </button>
          <button
            type='button'
            className={this.getButtonStyle('laws')}
            onClick={() => this.changeView('laws')}
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
