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
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import Files from 'templates/components/form_modules/files';
import Checkbox from 'templates/components/form_modules/checkbox';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import Modal from 'react-responsive-modal';
import SubmitButton from 'templates/components/form_modules/submit_button';

class Contract extends React.Component {
  state = {
    data_received: false,
    edit_mode: contractsStore.full_edit_access || contractsStore.contract.id === 0,
    edms_doc_opened: false
  };

  componentDidMount() {
    if (contractsStore.contract.id !== 0) {
      this.getContract();
    } else {
      this.setState({data_received: true});
    }
  }

  getContract = () => {
    axiosGetRequest('get_contract/' + contractsStore.contract.id + '/')
      .then((response) => {
        contractsStore.contract = response;
        this.setState({data_received: true});
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(contractsStore.contract.number)) {
      notify('Заповніть поле "Номер Договору"');
      return false;
    }
    if (isBlankOrZero(contractsStore.contract.subject)) {
      notify('Заповніть поле "Предмет Договору"');
      return false;
    }
    if (isBlankOrZero(contractsStore.contract.counterparty)) {
      notify('Заповніть поле "Контрагент"');
      return false;
    }
    if (isBlankOrZero(contractsStore.contract.date_start)) {
      notify('Оберіть дату початку дії Договору');
      return false;
    }
    if (isBlankOrZero(contractsStore.contract.new_files) && isBlankOrZero(contractsStore.contract.old_files)) {
      notify('Додайте підписаний файл Договору');
      return false;
    }
    return true;
  };

  areDatesInOrder = () => {
    if (contractsStore.contract.date_end && contractsStore.contract.date_end < contractsStore.contract.date_start) {
      notify('Ви неправильно обрали термін дії Договору');
      return false;
    }
    return true;
  };

  changeTableAndClose = (mode) => {
    if (mode === 'add') {
      contractsStore.contracts.push(contractsStore.contract);
    } else if (mode === 'edit') {
      const index = getIndex(contractsStore.contract.id, contractsStore.contracts);
      contractsStore.contracts[index] = contractsStore.contract;
    } else if (mode === 'del') {
      contractsStore.contracts = contractsStore.contracts.filter((contract) => contract.id !== contractsStore.contract.id);
    }
    this.props.close();
  };

  postContract = () => {
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      let formData = new FormData();
      formData.append('contract', JSON.stringify(contractsStore.contract));
      formData.append('old_files', JSON.stringify(contractsStore.contract.old_files)); // Файли додаємо окремо для простоти обробки на сервері
      if (contractsStore.contract.new_files?.length > 0) {
        contractsStore.contract.new_files.map((file) => {
          formData.append('new_files', file);
        });
      }

      const url = contractsStore.contract.id ? 'edit_contract/' : 'add_contract/';
      const mode = contractsStore.contract.id ? 'edit' : 'add';

      axiosPostRequest(url, formData)
        .then((response) => {
          contractsStore.contract.id = response;
          this.changeTableAndClose(mode);
        })
        .catch((error) => notify(error));
    }
  };

  postDelContract = () => {
    axiosPostRequest('deactivate_contract/' + contractsStore.contract.id + '/')
      .then((response) => {
        this.changeTableAndClose('del');
      })
      .catch((error) => notify(error));
  };

  onResponsibleChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    contractsStore.contract.responsible = e.target.options[selectedIndex].getAttribute('data-key');
    contractsStore.contract.responsible_name = e.target.options[selectedIndex].getAttribute('value');
  };

  onDepartmentChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    contractsStore.contract.department = e.target.options[selectedIndex].getAttribute('data-key');
    contractsStore.contract.department_name = e.target.options[selectedIndex].getAttribute('value');
  };

  onNumberChange = (e) => {
    contractsStore.contract.number = e.target.value;
    console.log(contractsStore.contract.number);
  };

  onSubjectChange = (e) => {
    contractsStore.contract.subject = e.target.value;
  };

  onCounterpartyChange = (e) => {
    contractsStore.contract.counterparty = e.target.value;
  };

  onNomenclatureGroupChange = (e) => {
    contractsStore.contract.nomenclature_group = e.target.value;
  };

  onDateStartChange = (e) => {
    contractsStore.contract.date_start = e.target.value;
  };

  onDateEndChange = (e) => {
    contractsStore.contract.date_end = e.target.value;
  };

  onFilesChange = (e) => {
    contractsStore.contract.new_files = e.target.value;
  };

  onFilesDelete = (id) => {
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...contractsStore.contract.old_files];
    for (const i in old_files) {
      if (old_files.hasOwnProperty(i) && old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    contractsStore.contract.old_files = [...old_files];
  };

  onLawyersReceivedChange = (e) => {
    contractsStore.contract.lawyers_received = !contractsStore.contract.lawyers_received;
  };

  onIsAdditionalContractChange = (e) => {
    contractsStore.contract.is_additional_contract = !contractsStore.contract.is_additional_contract;
  };

  onBasicContractChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    contractsStore.contract.basic_contract = e.target.options[selectedIndex].getAttribute('data-key');
    contractsStore.contract.basic_contract_subject = e.target.options[selectedIndex].getAttribute('value');
  };

  onCompanyChange = (event) => {
    contractsStore.contract.company = event.target.value;
  };

  render() {
    const {data_received, edit_mode, edms_doc_opened} = this.state;
    const {contract} = contractsStore;
    console.log(contract.company);

    if (data_received) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header d-flex'>
            <h5 className='ml-auto'>{contract.id !== 0 ? 'Редагування Договору № ' + contract.id : 'Додання Договору'}</h5>
          </div>
          <div className='modal-body'>
            <TextInput
              text={contract.number}
              fieldName={'Номер Договору'}
              onChange={this.onNumberChange}
              maxLength={50}
              disabled={!edit_mode}
            />
            <hr />
            <label className='mr-1'>Компанія:</label>
            <input type='radio' name='gate_radio' value='ТДВ' id='TDV' onChange={this.onCompanyChange} checked={contract.company === 'ТДВ'} />
            <label className='radio-inline mx-1' htmlFor='TDV'> ТДВ "ПЛХК"</label>
            <input type='radio' name='gate_radio' value='ТОВ' id='TOV' onChange={this.onCompanyChange} checked={contract.company === 'ТОВ'} />
            <label className='radio-inline mx-1' htmlFor='TOV'> ТОВ "ПЛХК"</label>
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

              <If condition={contract.basic_contract !== 0}>
                <div>
                  <a href={'./' + contract.basic_contract} target='_blank'>
                    Перейти до основного Договору
                  </a>
                </div>
              </If>
            </If>
            <hr />
            <TextInput
              text={contract.subject}
              fieldName={'Предмет'}
              onChange={this.onSubjectChange}
              maxLength={1000}
              disabled={!edit_mode}
            />
            <hr />
            <TextInput
              text={contract.counterparty}
              fieldName={'Контрагент'}
              onChange={this.onCounterpartyChange}
              maxLength={200}
              disabled={!edit_mode}
            />
            <hr />
            <TextInput
              text={contract.nomenclature_group}
              fieldName={'Номенклатурна група'}
              onChange={this.onNomenclatureGroupChange}
              maxLength={100}
              disabled={!edit_mode}
            />
            <hr />
            <DateInput
              date={contract.date_start}
              fieldName={'Початок дії Договору'}
              onChange={this.onDateStartChange}
              disabled={!edit_mode}
            />
            <hr />
            <DateInput date={contract.date_end} fieldName={'Кінець дії Договору'} onChange={this.onDateEndChange} disabled={!edit_mode} />
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
              disabled={!edit_mode && !contractsStore.full_edit_access}
              note={'Відзначають працівники ЮАВ'}
            />

            <hr />
            <Files
              oldFiles={contract.old_files}
              newFiles={contract.new_files}
              fieldName={'Підписані файли'}
              onChange={this.onFilesChange}
              onDelete={this.onFilesDelete}
              disabled={!edit_mode}
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
                <button className='btn btn-outline-dark' onClick={() => contractsStore.clearContract()}>
                  Очистити
                </button>
              </If>
              <If condition={contract.id !== 0}>
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

          {/*Вспливаюче повідомлення*/}
          <ToastContainer />
        </div>
      );
    } else {
      return <Loader />;
    }
  }

  static defaultProps = {
    close: () => {}
  };
}

export default view(Contract);
