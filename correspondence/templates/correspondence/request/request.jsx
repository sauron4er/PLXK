'use strict';
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import Product from './product';
import Client from './client';
import Answer from './answer';
import RequestFiles from './request_files';
import AnswerFiles from './answer_files';
import RequestDate from './request_date';
import RequestTerm from './request_term';
import AnswerDate from './answer_date';
import Responsible from './responsible';
import AnswerResponsible from './answer_responsible';
import Laws from './laws';
import {getItemById, isBlankOrZero, uniqueArray, getIndex} from 'templates/components/my_extras';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import {Loader} from 'templates/components/loaders';

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
  state = {
    loading: false
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(corrStore.request.product_id)) {
      notify('Оберіть тип продукту');
      return false;
    }
    if (isBlankOrZero(corrStore.request.client_id)) {
      notify('Оберіть клієнта');
      return false;
    }
    if (
      isBlankOrZero(corrStore.request.new_request_files) &&
      isBlankOrZero(corrStore.request.old_request_files)
    ) {
      notify('Додайте файл запиту');
      return false;
    }
    if (isBlankOrZero(corrStore.request.request_date)) {
      notify('Оберіть дату отримання запиту');
      return false;
    }
    if (isBlankOrZero(corrStore.request.responsible_id)) {
      notify('Оберіть відповідального за запит');
      return false;
    }
    if (isBlankOrZero(corrStore.request.answer_responsible_id)) {
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

  addSelectedLaw = () => {
    // Додає до запису закон, якщо автор забув натиснути "+"
    if (corrStore.selected_law_id) {
      const selected_law = getItemById(corrStore.selected_law_id, corrStore.laws);
      corrStore.request.laws.push(selected_law);
      corrStore.request.laws = uniqueArray(corrStore.request.laws);
    }
  };

  componentDidMount() {
    if (corrStore.request.id !== 0) {
      this.getRequestInfo()
      this.setState({loading: true});
    }
  }

  getRequestInfo = () => {
    axiosGetRequest('get_request/' + corrStore.request.id + '/')
      .then((response) => {
        corrStore.request = response;
        this.setState({loading: false});
      })
      .catch((error) => notify(error));
  };

  postRequest = () => {
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      this.addSelectedLaw();

      let formData = new FormData();
      formData.append('request', corrStore.request.id);
      formData.append('product_type', corrStore.request.product_id);
      formData.append('client', corrStore.request.client_id);
      formData.append('answer', corrStore.request.answer);
      formData.append('old_request_files', JSON.stringify(corrStore.request.old_request_files));
      formData.append('request_date', corrStore.request.request_date);
      formData.append('request_term', corrStore.request.request_term);
      formData.append('answer_date', corrStore.request.answer_date);
      formData.append('responsible', corrStore.request.responsible_id);
      formData.append('answer_responsible', corrStore.request.answer_responsible_id);
      formData.append('laws', JSON.stringify(corrStore.request.laws));
      formData.append('old_answer_files', JSON.stringify(corrStore.request.old_answer_files));
      if (corrStore.request.new_request_files?.length > 0) {
        corrStore.request.new_request_files.map((file) => {
          formData.append('new_request_files', file);
        });
      }
      if (corrStore.request.new_answer_files?.length > 0) {
        corrStore.request.new_answer_files.map((file) => {
          formData.append('new_answer_files', file);
        });
      }

      const url = corrStore.request.id ? 'edit_request/' : 'new_request/';

      axiosPostRequest(url, formData)
        .then((response) => this.addOrChangeRequest(response))
        .catch((error) => notify(error));
    }
  };

  postDelRequest = () => {
    axiosPostRequest('del_request/' + corrStore.request.id)
      .then((response) => this.removeRequest(response))
      .catch((error) => notify(error));
  };
  
  checkRequestStatus = () => {
    if (corrStore.request.answer_date) {
      return 'ok'
    } else {
      if (!corrStore.request.request_term || corrStore.request.request_term > new Date()) {
        return 'in progress'
      }
    }
    return 'overdue'
  }

  addOrChangeRequest = (id) => {
    corrStore.request.status = this.checkRequestStatus();
    if (corrStore.request.id === 0) {
      corrStore.request.id = id;
      corrStore.requests.push(corrStore.request);
    } else {
      const index = getIndex(corrStore.request.id, corrStore.requests);
      corrStore.requests[index] = corrStore.request
    }
    this.closeRequestView();
  };

  removeRequest = (id) => {
    corrStore.requests = corrStore.requests.filter(req => req.id !== id);
    this.closeRequestView();
  };

  clearRequest = () => {
    corrStore.request = {
      id: 0,
      product_id: 0,
      product_name: '',
      client_id: 0,
      client_name: '',
      answer: '',
      new_request_files: [],
      old_request_files: [],
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
    corrStore.selected_law_id = 0;
    corrStore.selected_law_name = '';
  };
  
  closeRequestView = () => {
    this.clearRequest()
    this.props.close('table')
  };

  render() {
    return (
      <Choose>
        <When condition={!this.state.loading}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <div className='modal-header d-flex'>
              <button
                className='btn btn-outline-success'
                onClick={() => this.closeRequestView()}
              >
                Назад
              </button>
              <h5 className='ml-auto'>
                {corrStore.request.id
                  ? 'Редагування запиту № ' + corrStore.request.id
                  : 'Додання запиту'}
              </h5>
            </div>

            <div className='modal-body'>
              <Product />
              <hr />
              <Client />
              <hr />
              <RequestFiles />
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
              <If condition={corrStore.request.id === 0}>
                <button className='btn btn-outline-dark' onClick={() => this.clearRequest()}>
                  Очистити
                </button>
              </If>
              <If condition={corrStore.request.id !== 0}>
                <button className='btn btn-outline-danger' onClick={() => this.postDelRequest()}>
                  Видалити
                </button>
              </If>
              <button className='btn btn-outline-success' onClick={() => this.postRequest()}>
                Зберегти
              </button>
            </div>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    close: () => {}
  };
}

export default view(Request);
