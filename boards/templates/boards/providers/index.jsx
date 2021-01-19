'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import Provider from './provider';
import ProvidersTable from './table';

class ProvidersIndex extends React.Component {
  state = {
    provider_id: 0,
    view: 'table' // provider
  };

  componentDidMount() {
    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретного постачальника:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      for (let i = 0; i < window.providers.length; i++) {
        if (window.providers[i].id === last_href_piece) {
          this.setState({
            provider_id: window.providers[i].id,
            view: 'provider'
          });
          break;
        }
      }
    }
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({
      provider_id: clicked_row.id,
      view: 'provider'
    });
  };

  changeView = (name) => {
    this.setState({view: name});
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {view, provider_id} = this.state;

    return (
      <Choose>
        <When condition={view==='table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <div className='mr-auto'>
              <button onClick={() => this.changeView('provider')} className='btn btn-sm btn-info mr-2'>
                Додати Постачальника
              </button>
            </div>

            <ProvidersTable onRowClick={this.onRowClick} />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => this.changeView('table')}>
            Назад
          </button>
          <br />
          <Provider id={provider_id} />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(ProvidersIndex);
