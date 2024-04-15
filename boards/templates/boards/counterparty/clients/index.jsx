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

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };
  
  componentDidMount() {
    counterpartyStore.type = 'client';
  }
  
  onRowClick = (clicked_row) => {
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
