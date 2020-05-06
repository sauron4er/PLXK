'use strict';
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import Client from './client';
import Answer from './answer';
import RequestFile from './request_file';
import AnswerFiles from './answer_files';
import RequestDate from './request_date';
import RequestTerm from './request_term';
import AnswerDate from './answer_date';
import Responsible from './responsible';
import AnswerResponsible from './answer_responsible';
import Laws from './laws';
import {testForBlankOrZero} from 'templates/components/my_extras';
import { axiosPostRequest } from 'templates/components/axios_requests';
import querystring from 'querystring'; // for axios

const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Request extends React.Component {
  areAllFieldsFilled = () => {
    if (testForBlankOrZero(corrStore.request.client_id)) {
      notify('Оберіть клієнта');
      return false;
    }
    if (
      testForBlankOrZero(corrStore.request.new_eml_file) &&
      testForBlankOrZero(corrStore.request.old_eml_file)
    ) {
      notify('Додайте файл запиту');
      return false;
    }
    if (testForBlankOrZero(corrStore.request.request_date)) {
      notify('Оберіть дату отримання запиту');
      return false;
    }
    if (testForBlankOrZero(corrStore.request.responsible_id)) {
      notify('Оберіть відповідального за запит');
      return false;
    }
    if (testForBlankOrZero(corrStore.request.answer_responsible_id)) {
      notify('Оберіть відповідального за надання відповіді');
      return false;
    }
    return true;
  };

  areDatesInOrder = () => {
    if (
      corrStore.request?.request_term &&
      corrStore.request.request_term < corrStore.request.request_date
    ) {
      notify('Термін виконання не може бути меншим, ніж дата отримання запиту');
      return false;
    }
    if (
      corrStore.request?.answer_date &&
      corrStore.request.answer_date < corrStore.request.request_date
    ) {
      notify('Дата надання відповіді не може бути меншою, ніж дата отримання запиту');
      return false;
    }
    return true;
  };

  postNewRequest = (e) => {
    e.preventDefault();

    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      let formData = new FormData();
      // TODO Додати в formData усі поля з request по черзі
      formData.append('request', querystring.stringify(corrStore.request));
      const url = corrStore.request.id ? 'edit_request/' : 'new_request/'

      axiosPostRequest(url, formData)
        .then(response => this.addRequest(response))
        .catch(error => notify(error));
    }
  };

  postDelRequest = (e) => {
    e.preventDefault();
    let formData = new FormData();
      formData.append('id', corrStore.request.id);

      axiosPostRequest('del_request/', formData)
        .then(response => this.removeRequest())
        .catch(error => notify(error));
  };

  addRequest = (id) => {
    corrStore.request.id = id
  };

  removeRequest = () => {

  };

  clearRequest = (e) => {
    e.preventDefault();
    corrStore.request = {
      id: 0,
      client_id: 0,
      client_name: '',
      answer: '',
      new_eml_file: {},
      old_eml_file: {
        file: '',
        name: '',
        id: 0
      },
      new_answer_files: [],
      old_answer_files: [],
      request_date: '',
      request_term: '',
      answer_date: '',
      responsible_id: 0,
      responsible_name: '',
      answer_responsible_id: 0,
      answer_responsible_name: '',
      laws: []
    };
  };

  test = (e) => {
    e.preventDefault();
    console.log(corrStore.request);
  };

  render() {
    return (
      <div className='shadow-lg p-3 mb-5 bg-white rounded'>
        <div className='modal-header d-flex'>
          <button className='btn btn-outline-success' onClick={(e) => this.props.close(e, 'table')}>
            Назад
          </button>
          <h5 className='ml-auto'>
            {corrStore.request.id
              ? 'Редагування запиту № ' + corrStore.request.id
              : 'Додання запиту'}
          </h5>
        </div>

        <div className='modal-body'>
          <Client />
          <hr />
          <RequestFile />
          <hr />
          <Answer />
          <hr />
          <AnswerFiles />
          <hr />
          <Laws />
          <hr />
          <div className='d-md-flex'>
            <div className='mr-auto'>
              <RequestDate />
            </div>
            <div className='mr-auto'>
              <RequestTerm />
            </div>
            <AnswerDate />
          </div>
          <hr />
          <Responsible />
          <hr />
          <AnswerResponsible />
        </div>
        <div className='modal-footer'>
          <button className='btn btn-outline-danger' onClick={this.test}>
            test
          </button>
          <If condition={corrStore.request.id === 0}>
            <button className='btn btn-outline-dark' onClick={this.clearRequest}>
              Очистити
            </button>
          </If>
          <If condition={corrStore.request.id !== 0}>
            <button className='btn btn-outline-danger' onClick={this.postDelRequest}>
              Видалити
            </button>
          </If>
          <button className='btn btn-outline-success' onClick={this.postNewRequest}>
            Зберегти
          </button>
        </div>

        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </div>
    );
  }

  static defaultProps = {
    close: () => {}
  };
}

export default view(Request);
