'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import ContractView from "docs/templates/docs/contracts/contract_view";
import Modal from 'react-responsive-modal';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class ChooseMainContract extends React.Component {
  state = {
    is_main_contract: true,
    contracts: {},
    contract_modal_open: false
  };

  // отримуємо з бд список шефів
  getContracts() {
    axiosGetRequest('get_contracts/')
      .then((response) => {
        this.setState({contracts: response});
      })
      .catch((error) => notify(error));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState !== this.state) {
      if (this.state.is_main_contract !== true && !this.state.contracts?.length) this.getContracts();
    }
  }

  render() {
    const {is_main_contract, contracts, contract_modal_open} = this.state;
    const {contract_link, contract_link_name} = newDocStore.new_document;
    const {module_info, onChange} = this.props;

    return (
      <>
        <input
          className='ml-2'
          type='radio'
          name={'is_main_radio'}
          id={'main'}
          value='m'
          onChange={() => this.setState({is_main_contract: true})}
          checked={is_main_contract}
        />
        <label className='radio-inline mx-1' htmlFor={'main'}>
          Це основний Договір
        </label>
        <input
          className='ml-2'
          type='radio'
          name={'is_main_radio'}
          id={'not_main'}
          value='m'
          onChange={() => this.setState({is_main_contract: false})}
          checked={!is_main_contract}
        />
        <label className='radio-inline mx-1' htmlFor={'not_main'}>
          Це додаткова Угода
        </label>
        <small className='text-danger'>{module_info?.additional_info}</small>

        <If condition={!is_main_contract}>
          <Choose>
            <When condition={contracts?.length > 0}>
              <label className='full_width' htmlFor='contract_select'>
                <If condition={module_info.required}>{'* '}</If> {module_info.field_name}:
                <select id='contract_select' name='contract' className='form-control full_width' value={contract_link_name} onChange={onChange}>
                  <option key={0} data-key={0} value='0'>
                    ------------
                  </option>
                  {contracts.map((contract) => {
                    return (
                      <option key={contract.id} data-key={contract.id} value={contract.name}>
                        {contract.name}
                      </option>
                    );
                  })}
                </select>
              </label>

              <If condition={contract_link !== 0}>
                <button className='btn btn-outline-info' onClick={() => this.setState({contract_modal_open: true})}>
                  Переглянути Договір
                </button>
              </If>
            </When>
            <Otherwise>
              <div className='mt-3 loader-small' id='loader-1'>
                {' '}
              </div>
            </Otherwise>
          </Choose>
        </If>

        <Modal
          open={contract_modal_open}
          onClose={() => this.setState({contract_modal_open: false})}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 50}}}
        >
          <ContractView id={contract_link} />
        </Modal>
      </>
    );
  }

  static defaultProps = {
    module_info: {
      field_name: 'Посилання на основний Договір',
      queue: 0,
      required: false,
      additional_info: null
    },
    onChange: () => {}
  };
}

export default view(ChooseMainContract);
