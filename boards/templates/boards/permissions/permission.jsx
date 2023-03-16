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
import Selector from 'templates/components/form_modules/selectors/selector';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import Files from 'templates/components/form_modules/files';
import Checkbox from 'templates/components/form_modules/checkbox';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import Modal from 'react-responsive-modal';
import SubmitButton from 'templates/components/form_modules/submit_button';
import DxTable from 'templates/components/tables/dx_table';
import permissionsStore from 'boards/templates/boards/permissions/old/permissions_store';

class Permission extends React.Component {
  state = {
    data_received: false
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getPermission();
    } else {
      this.setState({data_received: true});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.id !== this.props.id && this.props.id !== 0) this.getPermission();
  }

  getPermission = () => {
    axiosGetRequest('get_permission/' + this.props.id + '/')
      .then((response) => {
        permissionsStore.permission = response.permission;
        this.setState({data_received: true});
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    const {permission} = permissionsStore;
    if (isBlankOrZero(permission.category)) {
      notify('Заповніть поле "Категорія"');
      return false;
    }
    if (isBlankOrZero(permission.name)) {
      notify('Заповніть поле "Назва"');
      return false;
    }
    if (isBlankOrZero(permission.date_next)) {
      notify('Заповніть поле "Наступний перегляд"');
      return false;
    }
    return true;
  };

  areDatesInOrder = () => {
    const today = new Date();
    const {permission} = permissionsStore;
    const date_next = new Date(permission.date_next);
    if (today > date_next) {
      notify('Дата наступного перегляду не може бути меншою за сьогодні');
      return false;
    }
    return true;
  };

  postPermission = () => {
    const {permission} = permissionsStore;
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      let formData = new FormData();
      formData.append('permission', JSON.stringify(permission));
      // formData.append('old_files', JSON.stringify(permission.old_files)); // Файли додаємо окремо для простоти обробки на сервері
      // if (permission.new_files?.length > 0) {
      //   permission.new_files.map((file) => {
      //     formData.append('new_files', file);
      //   });
      // }

      const url = this.props.id ? 'edit_permission/' : 'add_permission/';
      permissionsStore.permission_view = false;

      axiosPostRequest(url, formData)
        .then((response) => {
          permissionsStore.permission.id = response;
        })
        .catch((error) => notify(error));
    }
  };

  postDelPermission = () => {
    axiosPostRequest('deactivate_permission/' + this.props.id + '/')
      .then((response) => {
        permissionsStore.permission_view = false;
      })
      .catch((error) => notify(error));
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
    contract.counterparty = e.id;
    contract.counterparty_name = e.name;
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
    const {data_received, edit_mode, edms_doc_opened, view, additional_contracts, additional_contract_id, contract, counterparties} =
      this.state;
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
                    <div>{`На сайт додав/додала: ${this.state.contract.author_name}`}</div>
                    <small>Поля, позначені зірочкою, є обов’язковими</small>
                    <If condition={this.props.id === 0}>
                      <div>
                        <small className='text-danger'>
                          Зверніть увагу! На даній сторінці вносяться уже затверджені і підписані з контрагентами Договори.
                        </small>
                      </div>
                      <div>
                        <small className='text-danger'>
                          Якщо ви хочете відправити Договір на погодження, скористайтесь сторінкою{' '}
                          <a href={`${window.location.origin}/edms/my_docs/`} target='_blank'>
                            Електронні документи
                          </a>
                          .
                        </small>
                      </div>
                    </If>
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
                        Це поле було заповнене без використання довідника контрагентів. Для того, щоб даний контракт відображався на
                        сторінці контрагента, будь ласка, оберіть його зі списку нижче і збережіть зміни.
                      </small>
                    </If>
                  </If>
                  <SelectorWithFilter
                    list={counterparties}
                    fieldName={'* Контрагент'}
                    value={{name: contract.counterparty_name, id: contract.counterparty}}
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
                  styles={{modal: {marginTop: 75}}}
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
                      <Permission id={additional_contract_id} is_main_contract={false} changeAdditionalTable={this.changeAdditionalTable} />
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

export default view(Permission);
