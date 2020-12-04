'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import ContractView from "docs/templates/docs/contracts/contract_view";
import Modal from 'react-responsive-modal';

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
    const {name, id} = this.props.contract;
    const {fieldName, onChange} = this.props;

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

        <If condition={!is_main_contract}>
          <Choose>
            <When condition={contracts?.length > 0}>
              <label className='full_width' htmlFor='contract_select'>
                {fieldName}:
                <select id='contract_select' name='contract' className='form-control full_width' value={name} onChange={onChange}>
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

              <If condition={id !== 0}>
                <button className='btn btn-outline-success' onClick={() => this.setState({contract_modal_open: true})}>
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
          <ContractView id={id} />
        </Modal>
      </>
    );
  }

  static defaultProps = {
    contract: {},
    fieldName: 'Посилання на основний Договір'
  };
}

export default ChooseMainContract;
