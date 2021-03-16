'use strict';
import * as React from 'react';
import Counterparty from '../components/counterparty';
import ClientsTable from './table';
import counterpartyStore from '../components/counterparty_store';

class ClientsIndex extends React.Component {
  state = {
    counterparty_id: 0,
    view: 'table' // counterparty
  };

  componentDidMount() {
    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретного постачальника:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      for (let i = 0; i < window.clients.length; i++) {
        if (window.clients[i].id === last_href_piece) {
          this.setState({
            counterparty_id: window.clients[i].id,
            view: 'counterparty'
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
    counterpartyStore.type = 'client';
    this.setState({
      counterparty_id: clicked_row.id,
      view: 'counterparty'
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
    const {view, counterparty_id} = this.state;

    return (
      <Choose>
        <When condition={view==='table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <If condition={window.edit_access}>
              <div className='mr-auto'>
                <button onClick={() => this.changeView('counterparty')} className='btn btn-sm btn-info mr-2'>
                  Додати клієнта
                </button>
              </div>
            </If>

            <ClientsTable onRowClick={this.onRowClick} />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => location.reload()}>
            Назад
          </button>
          <br />
          <Counterparty id={counterparty_id} />
        </Otherwise>
      </Choose>
    );
  }
}

export default ClientsIndex;
