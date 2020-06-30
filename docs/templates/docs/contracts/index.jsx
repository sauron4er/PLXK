'use strict';
import React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import Contract from 'docs/templates/docs/contracts/contract';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'number', title: 'Номер'},
  {name: 'subject', title: 'Предмет'},
  {name: 'counterparty', title: 'Контрагент'},
  {name: 'date_start', title: 'Діє з'},
  {name: 'date_end', title: 'Діє до'},
  {name: 'files', title: 'Файли'}
];

const col_width = [
  {columnName: 'id', width: 30},
  {columnName: 'number', width: 70},
  {columnName: 'date_start', width: 80},
  {columnName: 'date_canceled', width: 100}
];

class Contracts extends React.Component {
  state = {
    view: 'table', // table, contract
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    contractsStore.contracts = window.contracts;
    contractsStore.is_contracts_admin = window.is_contracts_admin;
    contractsStore.employees = window.employees;
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});

    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретний документ:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      for (let i = 0; i < contractsStore.contracts.length; i++) {
        if (contractsStore.contracts[i].id === last_href_piece) {
          contractsStore.contract = contractsStore.contracts[i];
          this.changeView('contract');
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
    contractsStore.contract = clicked_row;
    this.changeView('contract');
  };

  onContractClose = (mode='', contract, id) => {
    if (mode === 'added') {
      contract.id = id;
      contractsStore.contracts.push(contract);
    } else if (mode === 'deactivated') {
      contractsStore.contracts = contractsStore.contracts.filter((contract) => contract.id !== id);
    }
    this.changeView('table');
  };

  changeView = (name) => {
    this.setState({view: name});
  };

  render() {
    const {is_contracts_admin, main_div_height, view} = this.state;
  
    return (
      <Choose>
        <When condition={view === 'table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <If condition={contractsStore.is_contracts_admin}>
              <button onClick={() => this.changeView('contract')} className='btn btn-sm btn-success'>
                Додати Договір
              </button>
            </If>
            <DxTable
              rows={contractsStore.contracts}
              columns={columns}
              defaultSorting={[{columnName: 'number', direction: 'desc'}]}
              colWidth={col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-success my-2' onClick={() => this.changeView('table')}>
            Назад
          </button>
          <br />
          <Contract close={this.onContractClose} />
        </Otherwise>
      </Choose>
    );
  }
}

// ReactDOM.render(<Index />, document.getElementById('contracts'));
export default view(Contracts);