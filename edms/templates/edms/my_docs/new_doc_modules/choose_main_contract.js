'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import ContractView from 'docs/templates/docs/contracts/contract_simple_view';
import Modal from 'react-responsive-modal';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';

class ChooseMainContract extends React.Component {
  state = {
    is_main_contract: true,
    contracts: [],
    contract_modal_open: false,
    company: newDocStore.new_document.company,
    counterparty: newDocStore.new_document.counterparty,
    loading: false
  };
  
  getContracts() {
    if (newDocStore.new_document.counterparty) {
      this.setState({loading: true}, () => {
        axiosGetRequest(`get_contracts/${newDocStore.new_document.company}/${newDocStore.new_document.counterparty}`)
          .then((response) => {
            this.setState({
              contracts: response,
              loading: false
            });
          })
          .catch((error) => notify(error));
      });
    }
  }

  // отримуємо від серверу реєстраційний номер цієї угоди
  getRegistrationNumber(main_contract_id) {
    axiosGetRequest(`get_add_contract_reg_number/${main_contract_id}`)
      .then((response) => {
        newDocStore.new_document.registration_number = response;
      })
      .catch((error) => notify(error));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.state.is_main_contract && prevState.loading === this.state.loading) {
      // мусимо ігнорувати loading, бо він запускає в безкінечний componentDidUpdate

      if (prevState.company !== newDocStore.new_document.company) {
        this.getContracts();
        this.setState({company: newDocStore.new_document.company});
      } else if (prevState.counterparty !== newDocStore.new_document.counterparty) {
        this.getContracts();
        this.setState({counterparty: newDocStore.new_document.counterparty});
      } else if (newDocStore.new_document.counterparty && !this.state.contracts?.length) {
        this.getContracts();
      }
    }
  }

  onMainContractChange = (contract) => {
    this.props.onChange(contract);
    this.getRegistrationNumber(contract.id);
  };

  render() {
    const {is_main_contract, contracts, contract_modal_open, loading} = this.state;
    const {contract_link, contract_link_name, company, counterparty} = newDocStore.new_document;
    // company мушу сюди підтягувати, бо інакше на цю змінну не дивиться ComponentDidUpdate
    const {module_info} = this.props;

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
            <When condition={!loading}>
              <Choose>
                <When condition={!counterparty}>
                  <div className='font-italic'>Оберіть контрагента, щоб вибрати основний Договір</div>
                </When>
                <When condition={contracts?.length !== 0}>
                  <SelectorWithFilter
                    list={contracts}
                    fieldName={module_info.field_name}
                    valueField='name'
                    selectedName=''
                    disabled={false}
                    value={{name: contract_link_name, id: contract_link}}
                    onChange={this.onMainContractChange}
                  />
                  <If condition={contract_link !== 0}>
                    <button className='btn btn-outline-info' onClick={() => this.setState({contract_modal_open: true})}>
                      Переглянути Договір
                    </button>
                  </If>
                </When>
                <Otherwise>
                  <div className='font-italic'>В базу не внесено жодного Договору з обраним контрагентом</div>
                </Otherwise>
              </Choose>
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
