'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {getIndex, isBlankOrZero, notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import Selector from 'templates/components/form_modules/selector';
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import Files from 'templates/components/form_modules/files';
import Checkbox from 'templates/components/form_modules/checkbox';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import Modal from 'react-responsive-modal';
import SubmitButton from 'templates/components/form_modules/submit_button';
import DxTable from 'templates/components/tables/dx_table';

const additional_contracts_columns = [
  {name: 'number', title: '№'},
  {name: 'subject', title: 'Предмет'}
];

const additional_contracts_width = [{columnName: 'number', width: 100}];

class Contract extends React.Component {
  state = {
    view: 'contract', //, 'additional'
    data_received: false,
    edit_mode: contractsStore.full_edit_access || this.props.id === 0,
    edms_doc_opened: false,
    additional_contracts: [],
    additional_contract_id: 0,
    contract: {
      id: 0,
      number: '',
      company: 'ТДВ',
      author: 0,
      author_name: '',
      subject: '',
      counterparty_old: '',
      counterparty_name: '',
      counterparty: 0,
      nomenclature_group: '',
      date_start: '',
      date_end: '',
      responsible: null,
      responsible_name: '',
      department: null,
      department_name: '',
      incoterms: '',
      purchase_terms: '',
      lawyers_received: false,
      is_additional_contract: false,
      basic_contract: null,
      basic_contract_subject: '',
      new_files: [],
      old_files: [],
      edms_doc_id: 0,
      is_author: false
    },
    main_contract_info_changed: false
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getContract();
    } else {
      this.setState({
        contract: {
          ...this.state.contract,
          counterparty: this.props.counterparty_id,
          counterparty_name: this.props.counterparty_name
        },
        data_received: true
      });
    }
    this.getCounterparties();
    this.getContractListForAdditionalContractChoose();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.id !== this.props.id && this.props.id !== 0) this.getContract();
  }

  getContract = () => {
    axiosGetRequest('get_contract/' + this.props.id + '/')
      .then((response) => {
        this.setState({
          contract: response.contract,
          edit_mode: contractsStore.full_edit_access || response.is_author,
          data_received: true
        });
      })
      .catch((error) => notify(error));
  };

  getContractListForAdditionalContractChoose = () => {
    axiosGetRequest('get_simple_contracts_list/' + contractsStore.counterparty_filter + '/' + contractsStore.view + '/')
      .then((response) => {
        contractsStore.contracts = response;
      })
      .catch((error) => notify(error));
  };

  getCounterparties = () => {
    axiosGetRequest('get_counterparties_for_select/')
      .then((response) => {
        this.setState({counterparties: response});
      })
      .catch((error) => console.log(error));
  };

  areAllFieldsFilled = () => {
    const {contract} = this.state;
    if (isBlankOrZero(contract.number)) {
      notify('Заповніть поле "Номер Договору"');
      return false;
    }
    if (isBlankOrZero(contract.subject)) {
      notify('Заповніть поле "Предмет Договору"');
      return false;
    }
    if (isBlankOrZero(contract.counterparty)) {
      notify('Заповніть поле "Контрагент"');
      return false;
    }
    if (isBlankOrZero(contract.date_start)) {
      notify('Оберіть дату початку дії Договору');
      return false;
    }
    if (isBlankOrZero(contract.new_files) && isBlankOrZero(contract.old_files)) {
      notify('Додайте підписаний файл Договору');
      return false;
    }
    return true;
  };

  areDatesInOrder = () => {
    const {contract} = this.state;
    if (contract.date_end && contract.date_end < contract.date_start) {
      notify('Ви неправильно обрали термін дії Договору');
      return false;
    }
    return true;
  };

  changeTableAndClose = (mode) => {
    const {contract} = this.state;
    if (this.props.is_main_contract) {
      if (mode === 'add') {
        contractsStore.contracts.push(contract);
      } else if (mode === 'edit') {
        const index = getIndex(this.props.id, contractsStore.contracts);
        contractsStore.contracts[index] = contract;
      } else if (mode === 'del') {
        contractsStore.contracts = contractsStore.contracts.filter((contract) => contract.id !== this.props.id);
      }
      this.props.close();
    } else {
      this.props.changeAdditionalTable(contract, mode);
    }
  };

  changeAdditionalTable = (changed_contract, mode) => {
    let new_additional_contracts = [...this.state.additional_contracts];
    if (mode === 'add') {
      new_additional_contracts.push(changed_contract);
    } else if (mode === 'edit') {
      const index = getIndex(changed_contract.id, new_additional_contracts);
      new_additional_contracts[index] = changed_contract;
    } else if (mode === 'del') {
      new_additional_contracts = new_additional_contracts.filter((contract) => contract.id !== changed_contract.id);
    }
    this.setState({
      additional_contracts: new_additional_contracts,
      additional_contract_id: 0
    });
  };

  postContract = () => {
    const {contract, main_contract_info_changed} = this.state;
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      let formData = new FormData();
      formData.append('contract', JSON.stringify(contract));
      formData.append('old_files', JSON.stringify(contract.old_files)); // Файли додаємо окремо для простоти обробки на сервері
      if (contract.new_files?.length > 0) {
        contract.new_files.map((file) => {
          formData.append('new_files', file);
        });
      }

      const url = this.props.id ? 'edit_contract/' : 'add_contract/';
      const mode = this.props.id ? 'edit' : 'add';

      axiosPostRequest(url, formData)
        .then((response) => {
          contract.id = response;
          this.changeTableAndClose(mode);
        })
        .catch((error) => notify(error));

      if (main_contract_info_changed) this.props.changeAdditionalTable(contract, 'del');
    }
  };

  postDelContract = () => {
    axiosPostRequest('deactivate_contract/' + this.props.id + '/')
      .then((response) => {
        this.changeTableAndClose('del');
      })
      .catch((error) => notify(error));
  };

  onRowClick = (clicked_row) => {
    this.setState({additional_contract_id: clicked_row.id});
  };

  getAdditionalContracts = () => {
    axiosGetRequest('get_additional_contracts/' + this.props.id + '/')
      .then((response) => {
        this.setState({additional_contracts: response});
      })
      .catch((error) => notify(error));
  };

  changeView = (view) => {
    this.setState({view: view});
    if (view === 'additional') this.getAdditionalContracts();
  };

  onResponsibleChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const contract = {...this.state.contract};
    contract.responsible = e.target.options[selectedIndex].getAttribute('data-key');
    contract.responsible_name = e.target.options[selectedIndex].getAttribute('value');
    this.setState({contract});
  };

  onDepartmentChange = (e) => {
    const contract = {...this.state.contract};
    const selectedIndex = e.target.options.selectedIndex;
    contract.department = e.target.options[selectedIndex].getAttribute('data-key');
    contract.department_name = e.target.options[selectedIndex].getAttribute('value');
    this.setState({contract});
  };

  onNumberChange = (e) => {
    const contract = {...this.state.contract};
    contract.number = e.target.value;
    this.setState({contract});
  };

  onSubjectChange = (e) => {
    const contract = {...this.state.contract};
    contract.subject = e.target.value;
    this.setState({contract});
  };

  onCounterpartyChange = (e) => {
    const contract = {...this.state.contract};
    contract.counterparty = e.value;
    contract.counterparty_name = e.label;
    this.setState({contract});
  };

  onIncotermsChange = (e) => {
    const contract = {...this.state.contract};
    contract.incoterms = e.target.value;
    this.setState({contract});
  };

  onPurchaseTermsChange = (e) => {
    const contract = {...this.state.contract};
    contract.purchase_terms = e.target.value;
    this.setState({contract});
  };

  onNomenclatureGroupChange = (e) => {
    const contract = {...this.state.contract};
    contract.nomenclature_group = e.target.value;
    this.setState({contract});
  };

  onDateStartChange = (e) => {
    const contract = {...this.state.contract};
    contract.date_start = e.target.value;
    this.setState({contract});
  };

  onDateEndChange = (e) => {
    const contract = {...this.state.contract};
    contract.date_end = e.target.value;
    this.setState({contract});
  };

  onFilesChange = (e) => {
    const contract = {...this.state.contract};
    contract.new_files = e.target.value;
    this.setState({contract});
  };

  onFilesDelete = (id) => {
    const contract = {...this.state.contract};
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...this.state.contract.old_files];
    for (const i in old_files) {
      if (old_files.hasOwnProperty(i) && old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    contract.old_files = [...old_files];
    this.setState({contract});
  };

  onLawyersReceivedChange = (e) => {
    const contract = {...this.state.contract};
    contract.lawyers_received = !contract.lawyers_received;
    this.setState({contract});
  };

  onIsAdditionalContractChange = (e) => {
    const contract = {...this.state.contract};
    contract.is_additional_contract = !contract.is_additional_contract;
    this.setState({
      contract: contract,
      main_contract_info_changed: true
    });
  };

  onBasicContractChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const contract = {...this.state.contract};
    contract.basic_contract = e.target.options[selectedIndex].getAttribute('data-key');
    contract.basic_contract_subject = e.target.options[selectedIndex].getAttribute('value');
    this.setState({
      contract: contract,
      main_contract_info_changed: true
    });
  };

  onCompanyChange = (event) => {
    const contract = {...this.state.contract};
    contract.company = event.target.value;
    this.setState({contract});
  };

  clearContract = () => {
    let contract = {...this.state.contract};
    contract = {
      id: 0,
      number: '',
      company: 'ТДВ',
      author: 0,
      author_name: '',
      subject: '',
      counterparty: '',
      nomenclature_group: '',
      date_start: '',
      date_end: '',
      responsible: null,
      responsible_name: '',
      department: null,
      department_name: '',
      lawyers_received: false,
      is_additional_contract: false,
      basic_contract: null,
      basic_contract_subject: '',
      old_files: [],
      new_files: [],
      edms_doc_id: 0
    };
    this.setState({contract});
  };

  render() {
    const {
      data_received,
      edit_mode,
      edms_doc_opened,
      view,
      additional_contracts,
      additional_contract_id,
      contract,
      counterparties
    } = this.state;
    const {is_main_contract} = this.props;
    const {contracts} = contractsStore;

    if (data_received) {
      return (
        <If condition={contract.id !== 0 || is_main_contract}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <Choose>
              <When condition={view === 'contract'}>
                <div className='modal-header'>
                  <div>
                    <Choose>
                      <When condition={this.props.id !== 0 && contract.basic_contract !== 0}>
                        <h5>{'Додаткова угода № ' + contract.number}</h5>
                      </When>
                      <Otherwise>
                        <h5>{this.props.id !== 0 ? 'Договір № ' + contract.number : 'Новий Договір'}</h5>
                      </Otherwise>
                    </Choose>
                    <small>Поля, позначені зірочкою, є обов’язковими</small>
                  </div>
                  <If condition={is_main_contract && contract.basic_contract === 0}>
                    <button className='btn btn-sm btn-outline-primary' onClick={() => this.changeView('additional')}>
                      Додаткові угоди
                    </button>
                  </If>
                </div>
                <div className='modal-body'>
                  <TextInput
                    text={contract.number}
                    fieldName={'* Номер Договору'}
                    onChange={this.onNumberChange}
                    maxLength={50}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <label className='mr-1'>Компанія:</label>
                  <input
                    type='radio'
                    name='gate_radio'
                    value='ТДВ'
                    id='TDV'
                    onChange={this.onCompanyChange}
                    checked={contract.company === 'ТДВ'}
                    disabled={!edit_mode}
                  />
                  <label className='radio-inline mx-1' htmlFor='TDV'>
                    {' '}
                    ТДВ "ПЛХК"
                  </label>
                  <input
                    type='radio'
                    name='gate_radio'
                    value='ТОВ'
                    id='TOV'
                    onChange={this.onCompanyChange}
                    checked={contract.company === 'ТОВ'}
                    disabled={!edit_mode}
                  />
                  <label className='radio-inline mx-1' htmlFor='TOV'>
                    {' '}
                    ТОВ "ПЛХК"
                  </label>
                  <hr />
                  <Checkbox
                    checked={contract.is_additional_contract}
                    fieldName={'Це додаткова угода'}
                    onChange={this.onIsAdditionalContractChange}
                    disabled={!edit_mode}
                  />
                  <If condition={contract.is_additional_contract}>
                    <Selector
                      list={contracts}
                      selectedName={contract.basic_contract_subject}
                      valueField={'selector_info'}
                      fieldName={'Основний Договір'}
                      onChange={this.onBasicContractChange}
                      disabled={!edit_mode}
                    />
                  </If>
                  <hr />
                  <TextInput
                    text={contract.subject}
                    fieldName={'* Предмет'}
                    onChange={this.onSubjectChange}
                    maxLength={1000}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <If condition={contract.counterparty_old !== ''}>
                    <div>
                      Контрагент: <span className='font-weight-bold'>{contract.counterparty_old}</span>
                    </div>
                    <If condition={edit_mode}>
                      <small className='text-danger'>
                        Це поле було заповнене до створення довідника контрагентів, будь ласка, оберіть контрагента зі списку нижче і
                        збережіть зміни, щоб даний контракт відображався на сторінці контрагента
                      </small>
                    </If>
                  </If>
                  <SelectorWithFilter
                    list={counterparties}
                    fieldName={'* Контрагент'}
                    value={{label: contract.counterparty_name, value: contract.counterparty}}
                    onChange={this.onCounterpartyChange}
                    disabled={this.props.counterparty_id !== 0 || !edit_mode}
                  />
                  <If condition={this.props.counterparty_id === 0}>
                    <small>
                      Якщо потрібного контрагента нема в списку, його можна додати на сторінці{' '}
                      <a href={`${window.location.origin}/boards/providers/`} target='_blank'>
                        Постачальники
                      </a>{' '}
                      або{' '}
                      <a href={`${window.location.origin}/boards/clients/`} target='_blank'>
                        {/*<a href={'http://127.0.0.1:8000/boards/clients/'} target='_blank'>*/}
                        Клієнти
                      </a>
                      . Якщо у вас нема прав на додавання контрагента у базу, зверніться до адміністратора
                    </small>
                  </If>
                  <hr />
                  <Files
                    oldFiles={contract.old_files}
                    newFiles={contract.new_files}
                    fieldName={'* Підписані файли'}
                    onChange={this.onFilesChange}
                    onDelete={this.onFilesDelete}
                    disabled={!edit_mode}
                  />
                  <hr />
                  {/*<TextInput*/}
                  {/*  text={contract.nomenclature_group}*/}
                  {/*  fieldName={'Номенклатурна група'}*/}
                  {/*  onChange={this.onNomenclatureGroupChange}*/}
                  {/*  maxLength={100}*/}
                  {/*  disabled={!edit_mode}*/}
                  {/*/>*/}
                  {/*<hr />*/}
                  <DateInput
                    date={contract.date_start}
                    fieldName={'* Початок дії Договору'}
                    onChange={this.onDateStartChange}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <DateInput
                    date={contract.date_end}
                    fieldName={'Кінець дії Договору'}
                    onChange={this.onDateEndChange}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <TextInput
                    text={contract.incoterms}
                    fieldName={'Умови поставки згідно ІНКОТЕРМС'}
                    onChange={this.onIncotermsChange}
                    maxLength={1000}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <TextInput
                    text={contract.purchase_terms}
                    fieldName={'Умови закупівлі'}
                    onChange={this.onPurchaseTermsChange}
                    maxLength={1000}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <Selector
                    list={contractsStore.departments}
                    selectedName={contract.department_name}
                    fieldName={'Місцезнаходження договору'}
                    onChange={this.onDepartmentChange}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <Selector
                    list={contractsStore.employees}
                    selectedName={contract.responsible_name}
                    fieldName={'Відповідальна особа'}
                    onChange={this.onResponsibleChange}
                    disabled={!edit_mode}
                  />
                  <hr />
                  <Checkbox
                    checked={contract.lawyers_received}
                    fieldName={'Юридично-адміністративний відділ отримав Договір'}
                    onChange={this.onLawyersReceivedChange}
                    defaultChecked={false}
                    disabled={!contractsStore.full_edit_access}
                    note={'Відзначають працівники ЮАВ'}
                  />

                  <hr />
                  <If condition={contract.edms_doc_id !== 0}>
                    <div>Документ в системі електронного документообігу: № {contract.edms_doc_id}</div>
                    <button className='btn btn-outline-info' onClick={() => this.setState({edms_doc_opened: true})}>
                      Показати
                    </button>
                  </If>
                </div>
                <If condition={edit_mode}>
                  <div className='modal-footer'>
                    <If condition={contract.id === 0}>
                      <button className='btn btn-outline-dark' onClick={() => this.clearContract()}>
                        Очистити
                      </button>
                    </If>
                    <If condition={this.props.id !== 0}>
                      <SubmitButton className='btn-outline-danger' onClick={() => this.postDelContract()} text='Видалити' />
                    </If>
                    <SubmitButton className='btn btn-outline-info' onClick={() => this.postContract()} text='Зберегти' />
                  </div>
                </If>

                <Modal
                  open={edms_doc_opened}
                  onClose={() => this.setState({edms_doc_opened: false})}
                  showCloseIcon={true}
                  closeOnOverlayClick={true}
                  styles={{modal: {marginTop: 50}}}
                >
                  <Document doc_id={contract.edms_doc_id} closed={true} />
                </Modal>
              </When>
              <Otherwise>
                <div className='d-flex'>
                  <button className='btn btn-sm btn-outline-primary ml-auto' onClick={() => this.changeView('contract')}>
                    Повернутись до основного Договору
                  </button>
                </div>
                <div className='row'>
                  <div className='col-4'>
                    <h6>Список додаткових угод</h6>
                    <DxTable
                      rows={additional_contracts}
                      columns={additional_contracts_columns}
                      defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                      colWidth={additional_contracts_width}
                      onRowClick={this.onRowClick}
                      // height={main_div_height}
                      filter
                    />
                  </div>
                  <div className='col-8'>
                    <If condition={additional_contract_id !== 0}>
                      <Contract id={additional_contract_id} is_main_contract={false} changeAdditionalTable={this.changeAdditionalTable} />
                    </If>
                  </div>
                </div>
              </Otherwise>
            </Choose>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
        </If>
      );
    } else {
      return <Loader />;
    }
  }

  static defaultProps = {
    id: 0,
    is_main_contract: true,
    close: () => {},
    changeAdditionalTable: () => {}
  };
}

export default view(Contract);
