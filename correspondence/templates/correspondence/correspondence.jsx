'use strict';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CorrTable from './table';
import Request from './request/request';
import Clients from './clients';
import Laws from './laws/laws';
import corrStore from './store';
import {axiosGetRequest} from 'templates/components/axios_requests';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view} from '@risingstack/react-easy-state';

class Correspondence extends React.Component {
  state = {
    view: 'requests', // requests, reclamations, samples, request, laws, scopes
    loading: false
  };

  componentDidMount() {
    this.getCorrespondence();
    corrStore.counterparty_id = this.props.counterparty_id;
    corrStore.counterparty_name = this.props.counterparty_name;

    // Визначаємо, чи відкриваємо просто список, чи це конкретне посилання:
    const arr = window.location.pathname.split('/');
    let filtered = arr.filter((el) => el !== '');
    const last_href_piece = parseInt(filtered[filtered.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) this.showRequest(last_href_piece);
  }

  getCorrespondence = () => {
    this.setState({loading: true});
    axiosGetRequest('get_correspondence/' + this.props.counterparty_id)
      .then((response) => {
        corrStore.correspondence = response;
        this.setState({loading: false}, () => {
          this.getInfo();
        });
      })
      .catch((error) => notify(error));
  };
  
  getInfo = () => {
    axiosGetRequest('get_correspondence_info')
      .then((response) => {
        corrStore.laws = response.laws;
        corrStore.clients = response.clients;
        corrStore.products = response.products;
        corrStore.employees = response.employees;
        corrStore.scopes = response.scopes;
      })
      .catch((error) => notify(error));
  };

  changeView = (name) => {
    if (name === 'requests') corrStore.request.type = 1;
    else if (name === 'reclamations') corrStore.request.type = 2;
    else if (name === 'samples') corrStore.request.type = 3;
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
    const {view, loading} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
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
          </Choose>
        </When>
        <Otherwise>
          <Loader/>
        </Otherwise>
      </Choose>
    );
  }
  
  static defaultProps = {
    counterparty_id: 0,
    counterparty_name: ''
  }
}

export default view(Correspondence);
