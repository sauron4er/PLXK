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
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';

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

  onCategoryChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    permissionsStore.permission.category = e.target.options[selectedIndex].getAttribute('data-key');
    permissionsStore.permission.category_name = e.target.options[selectedIndex].getAttribute('value');
  };

  onDepartmentChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    permissionsStore.permission.department = e.target.options[selectedIndex].getAttribute('data-key');
    permissionsStore.permission.department_name = e.target.options[selectedIndex].getAttribute('value');
  };

  onNameChange = (e) => {
    permissionsStore.permission.name = e.target.value;
  };

  onInfoChange = (e) => {
    permissionsStore.permission.info = e.target.value;
  };

  onCommentChange = (e) => {
    permissionsStore.permission.comment = e.target.value;
  };

  onNextDateChange = (e) => {
    permissionsStore.permission.date_next = e.target.value;
  };

  // onFilesChange = (e) => {
  //   const contract = {...this.state.contract};
  //   contract.new_files = e.target.value;
  //   this.setState({contract});
  // };
  //
  // onFilesDelete = (id) => {
  //   const contract = {...this.state.contract};
  //   // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
  //   let old_files = [...this.state.contract.old_files];
  //   for (const i in old_files) {
  //     if (old_files.hasOwnProperty(i) && old_files[i].id === id) {
  //       old_files[i].status = 'delete';
  //       break;
  //     }
  //   }
  //   contract.old_files = [...old_files];
  //   this.setState({contract});
  // };

  render() {
    const {permission} = permissionsStore;

    console.log(this.state.data_received);
    console.log(this.props.id);

    if (this.state.data_received) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header'>
            <h5>{this.props.id !== 0 ? 'Перегляд дозволу' : 'Новий дозвіл'}</h5>
            <small>Поля, позначені зірочкою, є обов’язковими</small>
          </div>
          <div className='modal-body'>
            <SelectorWithFilterAndAxios
              listNameForUrl='categories'
              fieldName='* Категорія'
              selectId='category_select'
              value={{name: permission.category_name, id: permission.category}}
              onChange={this.onCategoryChange()}
              disabled={false}
            />
            <hr />
            <SelectorWithFilterAndAxios
              listNameForUrl='departments'
              fieldName='Відділ'
              selectId='department_select'
              value={{name: permission.department_name, id: permission.department}}
              onChange={this.onDepartmentChange}
              disabled={false}
            />
            <hr />
            <TextInput text={permission.name} fieldName={'* Коротка назва'} onChange={this.onNameChange} maxLength={200} disabled={false} />
            <hr />
            <TextInput
              text={permission.info}
              fieldName={'* Інформація про дозвіл'}
              onChange={this.onNameChange}
              maxLength={5000}
              disabled={false}
            />
            <hr />
            <TextInput
              text={permission.comment}
              fieldName={'* Коментар автора'}
              onChange={this.onNameChange}
              maxLength={2000}
              disabled={false}
            />
            <hr />
            <DateInput date={permission.date_next} fieldName={'* Дата наступного перегляду'} onChange={this.onDateStartChange} />
            <hr />
            <div>Таблиця попередніх переглядів</div>
            <hr />

            {/*<Files*/}
            {/*  oldFiles={contract.old_files}*/}
            {/*  newFiles={contract.new_files}*/}
            {/*  fieldName={'* Підписані файли'}*/}
            {/*  onChange={this.onFilesChange}*/}
            {/*  onDelete={this.onFilesDelete}*/}
            {/*/>*/}
            {/*<hr />*/}
          </div>
          <div className='modal-footer'>
            <If condition={this.props.id !== 0}>
              <SubmitButton className='btn-outline-danger' onClick={() => this.postDelContract()} text='Видалити' />
            </If>
            <SubmitButton className='btn btn-outline-info' onClick={() => this.postContract()} text='Зберегти' />
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
    id: 0,
    is_main_contract: true,
    close: () => {},
    changeAdditionalTable: () => {}
  };
}

export default view(Permission);
