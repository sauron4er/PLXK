'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import Contract from 'docs/templates/docs/contracts/contract';
import ContractsTable from 'docs/templates/docs/contracts/table';
import counterpartyStore from '../../../../boards/templates/boards/counterparty/components/counterparty_store';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {counter} from '@fortawesome/fontawesome-svg-core';

class Contracts extends React.Component {
  componentDidMount() {
    this.getInfoForContractsPage();
    contractsStore.main_div_height = this.mainDivRef.clientHeight - 30; // розмір головного div, з якого вираховується розмір таблиць
    contractsStore.counterparty_filter = this.props.counterparty_filter;
  }

  getInfoForContractsPage = () => {
    axiosGetRequest('get_info_for_contracts_page')
      .then((response) => {
        contractsStore.employees = response.employees;
        contractsStore.departments = response.departments;
        contractsStore.full_edit_access = response.full_edit_access;
      })
      .catch((error) => notify(error));
  };

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
    const {counterparty_name, counterparty_filter} = this.props;

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

            <If condition={counterparty_filter === 0}>
              <div className='btn-group' role='group' aria-label='contracts_index'>
                <button type='button' className={this.getButtonStyle('ТДВ')} onClick={() => this.changeView('ТДВ')}>
                  ТДВ ПЛХК
                </button>
                <button type='button' className={this.getButtonStyle('ТОВ')} onClick={() => this.changeView('ТОВ')}>
                  ТОВ ПЛХК
                </button>
              </div>
            </If>
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
          <Contract
            id={contract.id}
            close={this.onContractClose}
            counterparty_id={counterparty_filter}
            counterparty_name={counterparty_name}
          />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    counterparty_filter: 0,
    counterparty_name: ''
  };
}

export default view(Contracts);
