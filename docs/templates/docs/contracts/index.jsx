'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import Contract from 'docs/templates/docs/contracts/contract';
import ContractsTable from 'docs/templates/docs/contracts/table';

class Contracts extends React.Component {
  componentDidMount() {
    contractsStore.employees = window.employees;
    contractsStore.departments = window.departments;
    contractsStore.full_edit_access = window.full_edit_access;
    contractsStore.main_div_height = this.mainDivRef.clientHeight - 30; // розмір головного div, з якого вираховується розмір таблиць
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    contractsStore.contract = clicked_row;
    contractsStore.contract_view = true;
  };

  onContractClose = () => {
    contractsStore.clearContract();
    contractsStore.contract_view = false;
  };

  changeView = (name) => {
    contractsStore.view = name;
  };

  onWithAdditionalChange = () => {
    contractsStore.with_additional = !contractsStore.with_additional;
  };

  getButtonStyle = (name) => {
    if (name === contractsStore.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {contract_view, contract, with_additional} = contractsStore;
  
    return (
      <Choose>
        <When condition={!contract_view}>
          <div className='d-flex mt-1'>
            <div className='mr-auto'>
              <button onClick={() => (contractsStore.contract_view = true)} className='btn btn-sm btn-info mr-2'>
                Додати Договір
              </button>

              <input
                type='checkbox'
                id='with_additional'
                name='with_additional'
                checked={with_additional}
                onChange={() => this.onWithAdditionalChange()}
              />
              <label className='ml-1 form-check-label' htmlFor='with_additional'>
                <small>Показувати у списку додаткові угоди</small>
              </label>
            </div>

            <div className='btn-group' role='group' aria-label='contracts_index'>
              <button type='button' className={this.getButtonStyle('ТДВ')} onClick={() => this.changeView('ТДВ')}>
                ТДВ ПЛХК
              </button>
              <button type='button' className={this.getButtonStyle('ТОВ')} onClick={() => this.changeView('ТОВ')}>
                ТОВ ПЛХК
              </button>
            </div>
          </div>
          <div className='row mt-2' ref={this.getMainDivRef}>
            <ContractsTable />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => this.onContractClose()}>
            Назад
          </button>
          <br />
          <Contract id={contract.id} close={this.onContractClose} />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(Contracts);
