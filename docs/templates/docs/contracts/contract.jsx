'use strict';
import React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import Selector from 'templates/components/form_modules/selector';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import Files from 'templates/components/form_modules/files';
import Checkbox from 'templates/components/form_modules/checkbox';

class Contract extends React.Component {
  state = {
    data_received: false,
    edit_mode: true
  };

  componentDidMount() {
    if (contractsStore.contract.id) {
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

      axiosPostRequest(url, formData)
        .then((response) => this.props.close('added'))
        .catch((error) => notify(error));
    }
  };

  postDelContract = () => {
    axiosPostRequest('del_contract/' + contractsStore.contract.id)
      .then((response) => this.props.close('deactivated'))
      .catch((error) => notify(error));
  };

  clearContract = () => {
    contractsStore.contract = {
      id: 0,
      number: '',
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
      new_files: []
    };
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

  render() {
    const {data_received, edit_mode} = this.state;

    if (data_received) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header d-flex'>
            <h5 className='ml-auto'>
              {contractsStore.contract.id !== 0 ? 'Редагування Договору № ' + contractsStore.contract.id : 'Додання Договору'}
            </h5>
          </div>
          <div className='modal-body'>
            <TextInput
              text={contractsStore.contract.number}
              fieldName={'Номер Договору'}
              onChange={this.onNumberChange}
              maxLength={10}
              edit_mode={edit_mode}
            />
            <hr />
            <TextInput
              text={contractsStore.contract.subject}
              fieldName={'Предмет'}
              onChange={this.onSubjectChange}
              maxLength={1000}
              edit_mode={edit_mode}
            />
            <hr />
            <TextInput
              text={contractsStore.contract.counterparty}
              fieldName={'Контрагент'}
              onChange={this.onCounterpartyChange}
              maxLength={200}
              edit_mode={edit_mode}
            />
            <hr />
            <TextInput
              text={contractsStore.contract.nomenclature_group}
              fieldName={'Номенклатурна група'}
              onChange={this.onNomenclatureGroupChange}
              maxLength={100}
              edit_mode={edit_mode}
            />
            <hr />
            <DateInput
              date={contractsStore.contract.date_start}
              fieldName={'Початок дії Договору'}
              onChange={this.onDateStartChange}
              edit_mode={edit_mode}
            />
            <hr />
            <DateInput
              date={contractsStore.contract.date_end}
              fieldName={'Кінець дії Договору'}
              onChange={this.onDateEndChange}
              edit_mode={edit_mode}
            />
            <hr />
            <Selector
              list={contractsStore.departments}
              selectedName={contractsStore.contract.department_name}
              fieldName={'Місцезнаходження договору'}
              onChange={this.onDepartmentChange}
              edit_mode={edit_mode}
            />
            <hr />
            <Selector
              list={contractsStore.employees}
              selectedName={contractsStore.contract.responsible_name}
              fieldName={'Відповідальна особа'}
              onChange={this.onResponsibleChange}
              edit_mode={edit_mode}
            />
            <hr />
            <Checkbox
              checked={contractsStore.contract.lawyers_received}
              fieldName={'Юридично-адміністративний відділ отримав Договір'}
              onChange={this.onLawyersReceivedChange}
              defaultChecked={false}
              edit_mode={edit_mode && contractsStore.full_edit_access}
              note={'Відзначають працівники ЮАВ'}
            />

            <hr />
            <Files
              oldFiles={contractsStore.contract.old_files}
              newFiles={contractsStore.contract.new_files}
              fieldName={'Підписані файли'}
              onChange={this.onFilesChange}
              onDelete={this.onFilesDelete}
              edit_mode={edit_mode}
            />
            <hr />
            <Checkbox
              checked={contractsStore.contract.is_additional_contract}
              fieldName={'Це додаткова угода'}
              onChange={this.onIsAdditionalContractChange}
              edit_mode={edit_mode}
            />
            <If condition={contractsStore.contract.is_additional_contract}>
              <Selector
                list={contractsStore.contracts}
                selectedName={contractsStore.contract.basic_contract_subject}
                valueField={'selector_info'}
                fieldName={'Основний Договір'}
                onChange={this.onBasicContractChange}
                edit_mode={edit_mode}
              />

              <If condition={contractsStore.contract.basic_contract !== 0}>
                <div>
                  <a href={'./' + contractsStore.contract.basic_contract} target='_blank'>
                    Перейти до основного Договору
                  </a>
                </div>
              </If>
            </If>
            <hr />
          </div>
          <If condition={edit_mode}>
            <div className='modal-footer'>
              <If condition={contractsStore.contract.id === 0}>
                <button className='btn btn-outline-dark' onClick={() => this.clearContract()}>
                  Очистити
                </button>
              </If>
              <If condition={contractsStore.contract.id !== 0}>
                <button className='btn btn-outline-danger' onClick={() => this.postDelContract()}>
                  Видалити
                </button>
              </If>
              <button className='btn btn-outline-success' onClick={() => this.postContract()}>
                Зберегти
              </button>
              <button className='btn btn-outline-success' onClick={() => console.log(contractsStore.contract)}>
                test
              </button>
            </div>
          </If>

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
