'use strict';
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import TextInput from 'templates/components/form_modules/text_input';
import Selector from 'templates/components/form_modules/selector';
import MultiSelector from 'templates/components/form_modules/multi_selector';
import DateInput from 'templates/components/form_modules/date_input';
import List from 'templates/components/form_modules/list';
import {getItemById, isBlankOrZero, uniqueArray, getIndex, notify} from 'templates/components/my_extras';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import {Loader} from 'templates/components/loaders';
import Files from 'templates/components/form_modules/files';
import LawsList from './laws_list';

class Request extends React.Component {
  state = {
    edit_mode: true,
    user_is_author: true,
    loading: false
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(corrStore.request.product_id)) {
      notify('Оберіть тип продукту');
      return false;
    }
    if (isBlankOrZero(corrStore.request.scope_id)) {
      notify('Оберіть сферу застосування');
      return false;
    }
    if (isBlankOrZero(corrStore.request.client_id)) {
      notify('Оберіть клієнта');
      return false;
    }
    if (isBlankOrZero(corrStore.request.new_request_files) && isBlankOrZero(corrStore.request.old_request_files)) {
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
    if (corrStore.request?.request_term && corrStore.request.request_term < corrStore.request.request_date) {
      notify('Термін виконання не може бути меншим, ніж дата отримання запиту');
      return false;
    }
    if (corrStore.request?.answer_date && corrStore.request.answer_date < corrStore.request.request_date) {
      notify('Дата надання відповіді не може бути меншою, ніж дата отримання запиту');
      return false;
    }
    return true;
  };

  addSelectedLaw = () => {
    // Додає до запису закон, якщо автор забув натиснути "+"
    if (corrStore.request.selected_law_id) {
      const selected_law = getItemById(corrStore.request.selected_law_id, corrStore.laws);
      corrStore.request.laws.push(selected_law);
      corrStore.request.laws = uniqueArray(corrStore.request.laws);
    }
  };

  addSelectedAcquaint = () => {
    // Додає до запису закон, якщо автор забув натиснути "+"
    if (corrStore.request.selected_acquaint_id) {
      const selected_acquaint = getItemById(corrStore.request.selected_acquaint_id, corrStore.acquaints);
      corrStore.request.acquaints.push(selected_acquaint);
      corrStore.request.acquaints = uniqueArray(corrStore.request.acquaints);
    }
  };

  componentDidMount() {
    if (corrStore.request.id !== 0) {
      this.getRequestInfo();
      this.setState({loading: true});
    }
  }

  getRequestInfo = () => {
    axiosGetRequest('get_request/' + corrStore.request.id + '/')
      .then((response) => {
        corrStore.request = response.request;
        console.log(response.request);
        this.setState({
          edit_mode: response.edit_mode,
          user_is_author: response.user_is_author,
          loading: false
        });
      })
      .catch((error) => notify(error));
  };

  postRequest = () => {
    if (this.areAllFieldsFilled() && this.areDatesInOrder()) {
      this.addSelectedLaw();
      this.addSelectedAcquaint();

      let formData = new FormData();
      formData.append('request', corrStore.request.id);
      formData.append('type', corrStore.corr_type);
      formData.append('product_type', corrStore.request.product_id);
      formData.append('scope', corrStore.request.scope_id);
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
      formData.append('acquaints', JSON.stringify(corrStore.request.acquaints))
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

      const url = corrStore.request.id === 0 ? 'new_request/' : 'edit_request/';

      axiosPostRequest(url, formData)
        .then((response) => {
          corrStore.request.id === 0 ? this.addRequest(response) : this.editRequest(response);
        })
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
      return 'ok';
    } else {
      if (!corrStore.request.request_term || corrStore.request.request_term > new Date()) {
        return 'in progress';
      }
    }
    return 'overdue';
  };

  addRequest = (id) => {
    corrStore.request.status = this.checkRequestStatus();
    corrStore.request.id = id;
    corrStore.correspondence.push(corrStore.request);
    this.closeRequestView();
  };

  editRequest = (id) => {
    corrStore.request.status = this.checkRequestStatus();
    const index = getIndex(id, corrStore.correspondence);
    corrStore.correspondence[index] = corrStore.request;
    this.closeRequestView();
  };

  removeRequest = (id) => {
    corrStore.correspondence = corrStore.correspondence.filter((req) => req.id !== id);
    this.closeRequestView();
  };

  clearRequest = () => {
    corrStore.request = {
      id: 0,
      type: 1,
      product_id: 0,
      product_name: '',
      scope_id: 0,
      scope_name: '',
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
    this.clearRequest();
    this.props.close(corrStore.corr_type === 1 ? 'requests' : 'reclamations');
  };

  getCLientsForProductId = () => {
    return corrStore.clients.filter((client) => parseInt(corrStore.request.product_id) === client.product_type_id);
  };

  onSelectorChange = (e, field_id_name, field_name_name) => {
    const selectedIndex = e.target.options.selectedIndex;
    corrStore.request[field_id_name] = e.target.options[selectedIndex].getAttribute('data-key');
    corrStore.request[field_name_name] = e.target.options[selectedIndex].getAttribute('value');
  };

  onInputChange = (e, field_name) => {
    corrStore.request[field_name] = e.target.value;
  };

  onFilesChange = (e, new_files_field) => {
    corrStore.request[new_files_field] = e.target.value;
  };

  onFilesDelete = (id, old_files_field) => {
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...corrStore.request[old_files_field]];
    for (const i in old_files) {
      if (old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    corrStore.request[old_files_field] = [...old_files];
  };

  addLaw = () => {
    // if (corrStore.request.selected_law_id) {
    //   let existing_law = getItemById(corrStore.request.selected_law_id, corrStore.request.laws);
    //   if (existing_law !== -1) {
    //     for (const i in corrStore.request.laws) {
    //       if (corrStore.request.laws.hasOwnProperty(i) && corrStore.request.laws[i].id === parseInt(corrStore.request.selected_law_id)) {
    //         corrStore.request.laws[i].status = 'old';
    //         break;
    //       }
    //     }
    //   } else {
    //     let selected_law = getItemById(corrStore.request.selected_law_id, corrStore.laws);
    //     selected_law = {...selected_law, status: 'new'};
    //     corrStore.request.laws.push(selected_law);
    //     corrStore.request.laws = uniqueArray(corrStore.request.laws);
    //   }
    //   corrStore.request.selected_law_name = '';
    //   corrStore.request.selected_law_id = 0;
    // }
    if (corrStore.request.selected_law_id) {
      if (getItemById(corrStore.request.selected_law_id, corrStore.request.laws) === -1) {
        let selected_law = getItemById(corrStore.request.selected_law_id, corrStore.laws);
        selected_law = {...selected_law, status: 'new'};
        corrStore.request.laws.push(selected_law);
        corrStore.request.laws = uniqueArray(corrStore.request.laws);
      }
      corrStore.request.selected_law_name = '';
      corrStore.request.selected_law_id = 0;
    }
  };

  addAcquaint = () => {
    if (corrStore.request.selected_acquaint_id) {
      if (getItemById(corrStore.request.selected_acquaint_id, corrStore.request.acquaints) === -1) {
        let selected_acquaint = getItemById(corrStore.request.selected_acquaint_id, corrStore.employees);
        selected_acquaint = {...selected_acquaint, status: 'new'};
        corrStore.request.acquaints.push(selected_acquaint);
        corrStore.request.acquaints = uniqueArray(corrStore.request.acquaints);
      }
      corrStore.request.selected_acquaint_name = '';
      corrStore.request.selected_acquaint_id = 0;
    }
  };

  deleteAcquaint = (id) => {
    // Ці зміни необхідно проводити через окрему змінну, бо react-easy-state не розпізнає змін в глибині об’єктів
    let acquaints = [...corrStore.request.acquaints]
    for (const i in acquaints) {
      if (acquaints[i].id === id) {
        if (acquaints[i].status === 'new') {
          acquaints.splice(i, 1);
          break;
        } else {
          acquaints[i].status = 'delete';
          break;
        }
      }
    }
    corrStore.request.acquaints = [...acquaints]
  };

  getTitle = () => {
    const type = corrStore.corr_type === 1 ? 'запиту' : 'рекламації';
    return corrStore.request.id ? 'Редагування ' + type + ' № ' + corrStore.request.id : 'Додання ' + type;
  };

  render() {
    const {edit_mode, user_is_author} = this.state;

    return (
      <Choose>
        <When condition={!this.state.loading}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <div className='modal-header d-flex'>
              <button className='btn btn-outline-success' onClick={() => this.closeRequestView()}>
                Назад
              </button>
              <h5 className='ml-auto'>{this.getTitle()}</h5>
            </div>
            <If condition={corrStore.request.author}>
              <div className='float-right'>Автор: {corrStore.request.author}</div>
            </If>

            <div className='modal-body'>
              <Selector
                list={corrStore.products}
                selectedName={corrStore.request.product_name}
                fieldName={'Продукт'}
                onChange={(e) => this.onSelectorChange(e, 'product_id', 'product_name')}
                edit_mode={edit_mode}
              />
              <hr />
              <Selector
                list={corrStore.scopes}
                selectedName={corrStore.request.scope_name}
                fieldName={'Сфера застосування'}
                onChange={(e) => this.onSelectorChange(e, 'scope_id', 'scope_name')}
                edit_mode={edit_mode}
              />
              <hr />
              <Selector
                list={this.getCLientsForProductId()}
                selectedName={corrStore.request.client_name}
                fieldName={'Клієнт'}
                onChange={(e) => this.onSelectorChange(e, 'client_id', 'client_name')}
                edit_mode={edit_mode}
              />
              <hr />
              <Files
                oldFiles={corrStore.request.old_request_files}
                newFiles={corrStore.request.new_request_files}
                fieldName={'Файли запиту (.eml)'}
                onChange={(e) => this.onFilesChange(e, 'new_request_files')}
                onDelete={(id) => this.onFilesDelete(id, 'old_request_files')}
                edit_mode={edit_mode}
              />
              <hr />
              <TextInput
                text={corrStore.request.answer}
                fieldName={'Відповідь'}
                onChange={(e) => this.onInputChange(e, 'answer')}
                maxLength={5000}
                edit_mode={edit_mode}
              />
              <hr />
              <Files
                oldFiles={corrStore.request.old_answer_files}
                newFiles={corrStore.request.new_answer_files}
                fieldName={'Файли відповіді'}
                onChange={(e) => this.onFilesChange(e, 'new_answer_files')}
                onDelete={(id) => this.onFilesDelete(id, 'old_answer_files')}
                edit_mode={edit_mode}
              />
              <hr />
              <MultiSelector
                list={corrStore.laws}
                selectedName={corrStore.request.selected_law_name}
                fieldName={'Законодавство'}
                onChange={(e) => this.onSelectorChange(e, 'selected_law_id', 'selected_law_name')}
                addItem={this.addLaw}
                editMode={edit_mode}
              />
              <If condition={corrStore.request.laws.length > 0}>
                <LawsList disabled={!edit_mode} />
              </If>
              <hr />
              <div className='d-md-flex'>
                <div className='mr-auto'>
                  <DateInput
                    date={corrStore.request.request_date}
                    fieldName={'Дата отримання'}
                    onChange={(e) => this.onInputChange(e, 'request_date')}
                    edit_mode={edit_mode}
                  />
                </div>
                <div className='mr-auto'>
                  <DateInput
                    date={corrStore.request.request_term}
                    fieldName={'Термін виконання'}
                    onChange={(e) => this.onInputChange(e, 'request_term')}
                    edit_mode={edit_mode}
                  />
                </div>
                <DateInput
                  date={corrStore.request.answer_date}
                  fieldName={'Дата надання відповіді'}
                  onChange={(e) => this.onInputChange(e, 'answer_date')}
                  edit_mode={edit_mode}
                />
              </div>
              <hr />
              <Selector
                list={corrStore.employees.filter(employee => employee.correspondence_admin)}
                selectedName={corrStore.request.responsible_name}
                fieldName={'Відповідальний'}
                onChange={(e) => this.onSelectorChange(e, 'responsible_id', 'responsible_name')}
                edit_mode={edit_mode}
              />
              <hr />
              <Selector
                list={corrStore.employees.filter(employee => employee.correspondence_admin)}
                selectedName={corrStore.request.answer_responsible_name}
                fieldName={'Відповідальний за надання відповіді'}
                onChange={(e) => this.onSelectorChange(e, 'answer_responsible_id', 'answer_responsible_name')}
                edit_mode={edit_mode}
              />
              <hr />
              <TextInput
                text={corrStore.request.author_comment}
                fieldName={'Коментар автора'}
                onChange={(e) => this.onInputChange(e, 'author_comment')}
                maxLength={1000}
                edit_mode={user_is_author}
              />
              <hr />
              <MultiSelector
                list={corrStore.employees}
                selectedName={corrStore.request.selected_acquaint_name}
                fieldName={'На ознайомлення'}
                onChange={(e) => this.onSelectorChange(e, 'selected_acquaint_id', 'selected_acquaint_name')}
                addItem={this.addAcquaint}
                editMode={edit_mode}
              />
              <List list={corrStore.request.acquaints} deleteItem={this.deleteAcquaint} disabled={!edit_mode} />
            </div>
            <If condition={edit_mode}>
              <div className='modal-footer'>
                <button className='btn btn-outline-dark' onClick={() => console.log(corrStore.request)}>
                  test
                </button>
                <If condition={corrStore.request.id === 0}>
                  <button className='btn btn-outline-dark' onClick={() => this.clearRequest()}>
                    Очистити
                  </button>
                </If>
                <If condition={corrStore.request.id !== 0 && user_is_author}>
                  <button className='btn btn-outline-danger' onClick={() => this.postDelRequest()}>
                    Видалити
                  </button>
                </If>
                <button className='btn btn-outline-success' onClick={() => this.postRequest()}>
                  Зберегти
                </button>
              </div>
            </If>

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
