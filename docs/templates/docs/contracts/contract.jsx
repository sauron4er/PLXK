'use strict';
import React from 'react';
import FilesUpload from 'templates/components/files_uploader/files_upload';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Modal from 'react-responsive-modal';
import {Document, Page} from 'react-pdf';
import {getItemById, isBlankOrZero, notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import corrStore from '../../../../correspondence/templates/correspondence/store';
import UserSelect from 'templates/components/form_modules/user_select';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

const required_fields = {
  type_id: 'Тип документу',
  code: '№',
  name: 'Назва',
  files: 'Файли',
  author_id: 'Автор',
  responsible_id: 'Відповідальний',
  supervisory_id: 'Контролююча особа',
  date_start: 'Діє з'
};

class Contract extends React.Component {
  state = {
    data_received: false
  };

  componentDidMount() {
    if (contractsStore.contract.id) {
      this.getContract();
    } else {
      this.setState({data_received: true});
    }
  }

  getContract = (id) => {
    axiosGetRequest('get_contract/' + contractsStore.contract.id + '/')
      .then((response) => {
        contractsStore.contract = response;
        this.setState({data_received: true});
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    // if (isBlankOrZero(corrStore.request.product_id)) {
    //   notify('Оберіть тип продукту');
    //   return false;
    // }
    // if (isBlankOrZero(corrStore.request.scope_id)) {
    //   notify('Оберіть сферу застосування');
    //   return false;
    // }
    // if (isBlankOrZero(corrStore.request.client_id)) {
    //   notify('Оберіть клієнта');
    //   return false;
    // }
    // if (
    //   isBlankOrZero(corrStore.request.new_request_files) &&
    //   isBlankOrZero(corrStore.request.old_request_files)
    // ) {
    //   notify('Додайте файл запиту');
    //   return false;
    // }
    // if (isBlankOrZero(corrStore.request.request_date)) {
    //   notify('Оберіть дату отримання запиту');
    //   return false;
    // }
    // if (isBlankOrZero(corrStore.request.responsible_id)) {
    //   notify('Оберіть відповідального за запит');
    //   return false;
    // }
    // if (isBlankOrZero(corrStore.request.answer_responsible_id)) {
    //   notify('Оберіть відповідального за надання відповіді');
    //   return false;
    // }
    return true;
  };

  areDatesInOrder = () => {
    if (contractsStore.contract.date_end < contractsStore.contract.date_start) {
      notify('Ви неправильно обрали термін дії Договору');
      return false;
    }
    return true;
  };

  postContract = () => {
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      let formData = new FormData();
      // formData.append('request', corrStore.request.id);
      // formData.append('product_type', corrStore.request.product_id);
      // formData.append('scope', corrStore.request.scope_id);
      // formData.append('client', corrStore.request.client_id);
      // formData.append('answer', corrStore.request.answer);
      // formData.append('old_request_files', JSON.stringify(corrStore.request.old_request_files));
      // formData.append('request_date', corrStore.request.request_date);
      // formData.append('request_term', corrStore.request.request_term);
      // formData.append('answer_date', corrStore.request.answer_date);
      // formData.append('responsible', corrStore.request.responsible_id);
      // formData.append('answer_responsible', corrStore.request.answer_responsible_id);
      // formData.append('laws', JSON.stringify(corrStore.request.laws));
      // formData.append('old_answer_files', JSON.stringify(corrStore.request.old_answer_files));
      // if (corrStore.request.new_request_files?.length > 0) {
      //   corrStore.request.new_request_files.map((file) => {
      //     formData.append('new_request_files', file);
      //   });
      // }
      // if (corrStore.request.new_answer_files?.length > 0) {
      //   corrStore.request.new_answer_files.map((file) => {
      //     formData.append('new_answer_files', file);
      //   });
      // }

      const url = contractsStore.contract.id ? 'edit_contract/' : 'new_contract/';

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
    author_id: 0,
    author: '',
    subject: '',
    counterparty: '',
    nomenclature_group: '',
    date_start: '',
    date_end: '',
    responsible_id: 0,
    responsible: '',
    department_id: 0,
    department: '',
    lawyers_received: false,
    basic_contract_id: 0,
    basic_contract_subject: ''
    };
  }
  
  onResponsibleChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    contractsStore.contract.responsible_id = e.target.options[selectedIndex].getAttribute('data-key');
    contractsStore.contract.responsible = e.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {data_received} = this.state;

    if (data_received) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header d-flex'>
            <h5 className='ml-auto'>
              {contractsStore.contract.number
                ? 'Редагування Договору № ' + corrStore.request.number
                : 'Додання Договору'}
            </h5>
          </div>

          <div className='modal-body'>
            <UserSelect
              users={contractsStore.employees}
              user_name={contractsStore.contract.responsible}
              field_name={'Відповідальна особа'}
              onChange={this.onResponsibleChange}
            />
            {/*<Product />*/}
            {/*<hr />*/}
            {/*<Scope />*/}
            {/*<hr />*/}
            {/*<Client />*/}
            {/*<hr />*/}
            {/*<RequestFiles />*/}
            {/*<hr />*/}
            {/*<Answer />*/}
            {/*<hr />*/}
            {/*<AnswerFiles />*/}
            {/*<hr />*/}
            {/*<Laws />*/}
            {/*<hr />*/}
            {/*<div className='d-md-flex'>*/}
            {/*  <div className='mr-auto'>*/}
            {/*    <RequestDate />*/}
            {/*  </div>*/}
            {/*  <div className='mr-auto'>*/}
            {/*    <RequestTerm />*/}
            {/*  </div>*/}
            {/*  <AnswerDate />*/}
            {/*</div>*/}
            {/*<hr />*/}
            {/*<Responsible />*/}
            {/*<hr />*/}
            {/*<AnswerResponsible />*/}
          </div>
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
          </div>

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
