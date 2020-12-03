'use strict';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CorrTable from './table';
import Request from './request/request';
import Clients from './clients';
import Laws from './laws/laws';
import Scopes from './scopes';
import corrStore from './store';

class Correspondence extends React.Component {
  state = {
    view: 'requests' // requests, reclamations, samples, request, laws, scopes
  };

  componentDidMount() {
    corrStore.correspondence = window.correspondence;
    corrStore.laws = window.laws;
    corrStore.clients = window.clients;
    corrStore.products = window.products;
    corrStore.employees = window.employees;
    corrStore.scopes = window.scopes;

    // Визначаємо, чи відкриваємо просто список, чи це конкретне посилання:
    const arr = window.location.pathname.split('/');
    let filtered = arr.filter((el) => el !== '');
    const last_href_piece = parseInt(filtered[filtered.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) this.showRequest(last_href_piece);
  }

  changeView = (name) => {
    if (name === 'requests') corrStore.request.type = 1
    else if (name === 'reclamations') corrStore.request.type = 2
    else if (name === 'samples') corrStore.request.type = 3
    this.setState({view: name});
  };

  showRequest = (id) => {
    corrStore.request.id = id;
    this.setState({view: 'request'});
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {view} = this.state;
    return (
      <>
        <div className='btn-group mb-2' role='group' aria-label='corr_index'>
          <button type='button' className={this.getButtonStyle('requests')} onClick={() => this.changeView('requests')}>
            Запити
          </button>
          <button type='button' className={this.getButtonStyle('reclamations')} onClick={() => this.changeView('reclamations')}>
            Рекламації
          </button>
          <button type='button' className={this.getButtonStyle('samples')} onClick={() => this.changeView('samples')}>
            Заявки на взірці
          </button>
          <button type='button' className={this.getButtonStyle('laws')} onClick={() => this.changeView('laws')}>
            Законодавство
          </button>
          <button type='button' className={this.getButtonStyle('scopes')} onClick={() => this.changeView('scopes')}>
            Сфери застосування
          </button>
        </div>

        <Choose>
          <When condition={view === 'requests'}>
            <CorrTable corrType={1} showRequest={this.showRequest} />
          </When>
          <When condition={view === 'reclamations'}>
            <CorrTable corrType={2} showRequest={this.showRequest} />
          </When>
          <When condition={view === 'samples'}>
            <CorrTable corrType={3} showRequest={this.showRequest} />
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
          <When condition={view === 'scopes'}>
            <Scopes />
          </When>
        </Choose>
      </>
    );
  }
}

ReactDOM.render(<Correspondence />, document.getElementById('correspondence'));
