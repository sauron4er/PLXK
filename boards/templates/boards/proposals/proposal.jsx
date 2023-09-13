'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {getIndex, getItemById, isBlankOrZero, notify, uniqueArray} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
// import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import permissionsStore from 'boards/templates/boards/permissions/permissions_store';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import MultiSelectorWithAxios from 'templates/components/form_modules/selectors/multi_selector_with_axios';
import UseSetState from "templates/hooks/useSetState";
import { useEffect, useState } from "react";
import proposalsStore from "boards/templates/boards/proposals/proposals_store";

function Proposal(proposal_id=0) {
  const [dataReceived, setDataReceived] = useState(false)
  const [selectedResponsible, setSelectedResponsible] = useState(0)
  const [selectedResponsibleName, setSelectedResponsibleName] = useState(0)

  useEffect(() => {
    if (proposal_id !== 0) {
      getPermission();
    } else {
      setDataReceived(true)
    }
    }, [])

  useEffect(() => {
    if (proposal_id !== 0) getPermission();
    }, [proposal_id])

  function getPermission() {
    axiosGetRequest('get_proposal/' + proposal_id + '/')
      .then((response) => {
        proposalsStore.proposal = response;
        setDataReceived(true)
      })
      .catch((error) => notify(error));
  }

  function areAllFieldsFilled() {
    const {proposal} = proposalsStore;
    if (isBlankOrZero(proposal.proposal_name)) {
      notify('Заповніть поле "Назва пропозиції"');
      return false;
    }
    if (isBlankOrZero(proposal.proposal)) {
      notify('Заповніть поле "Текст пропозиції"');
      return false;
    }
    if (isBlankOrZero(proposal.responsible)) {
      notify('Оберіть відповідального за виконання');
      return false;
    }
    return true;
  }

  function areDatesInOrder() {
    const today = new Date();
    const {proposal} = proposalsStore;
    if (proposal.deadline) {
      const deadline_date = new Date(proposal.deadline);
    if (today > deadline_date) {
      notify('Строк виконання не може бути раніше за сьогодні');
      return false;
    }
    return true;
  }

  function postProposal() {
    const {proposal} = proposalsStore;
    if (areAllFieldsFilled() && areDatesInOrder()) {
      let formData = new FormData();
      formData.append('proposal', JSON.stringify(proposal));

      axiosPostRequest('add_proposal/', formData)
        .then((response) => {
          window.location.reload()
        })
        .catch((error) => notify(error));
    }
  }

  function postDelProposal() {
    axiosPostRequest('deactivate_proposal/' + proposal_id + '/')
      .then((response) => {
        window.location.reload()
      })
      .catch((error) => notify(error));
  }

  onCategoryChange = (e) => {
    permissionsStore.permission.category = e.id;
    permissionsStore.permission.category_name = e.name;
  };

  onDepartmentChange = (e) => {
    permissionsStore.permission.department = e.id;
    permissionsStore.permission.department_name = e.name;
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

  onDateNextChange = (e) => {
    permissionsStore.permission.date_next = e.target.value;
  };

  onResponsiblesChange = (list) => {
    permissionsStore.permission.responsibles = list;
    console.log(permissionsStore.permission.responsibles);
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
    if (this.state.data_received) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header'>
            <h5>{this.props.id !== 0 ? 'Перегляд дозволу' : 'Новий дозвіл'}</h5>
            <small>Поля, позначені зірочкою, є обов’язковими</small>
          </div>
          <div className='modal-body'>
            <div className='d-flex justify-content-between'>
              <SelectorWithFilterAndAxios
                listNameForUrl='permission_categories'
                fieldName='* Категорія'
                selectId='category_select'
                value={{name: permission.category_name, id: permission.category}}
                onChange={this.onCategoryChange}
                disabled={false}
              />
              <div className='mx-2'></div>
              <SelectorWithFilterAndAxios
                listNameForUrl='departments'
                fieldName='Відділ'
                selectId='department_select'
                value={{name: permission.department_name, id: permission.department}}
                onChange={this.onDepartmentChange}
                disabled={false}
              />
            </div>
            <hr />
            <TextInput text={permission.name} fieldName={'* Коротка назва'} onChange={this.onNameChange} maxLength={200} disabled={false} />
            <hr />
            <TextInput
              text={permission.info}
              fieldName={'Інформація про дозвіл'}
              onChange={this.onInfoChange}
              maxLength={5000}
              disabled={false}
            />
            <hr />

            <MultiSelectorWithAxios
              defaultSelected={permissionsStore.permission.responsibles}
              fieldName={'Відповідальні'}
              listNameForUrl='user_profiles'
              onChange={this.onResponsiblesChange}
              disabled={false}
            />
            <hr />
            <TextInput
              text={permission.comment}
              fieldName={'Коментар автора'}
              onChange={this.onCommentChange}
              maxLength={2000}
              disabled={false}
            />
            <hr />
            <DateInput
              date={permission.date_next}
              fieldName={'* Дата наступного перегляду'}
              onChange={this.onDateNextChange}
              disabled={false}
            />

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
              <SubmitButton className='btn-outline-danger' onClick={() => this.postDelPermission()} text='Видалити' />
            </If>
            <SubmitButton
              className='btn btn-outline-info'
              onClick={() => this.postPermission()}
              text='Зберегти'
              disabled={!permission.category || !permission.name || !permission.date_next}
            />
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
    close: () => {}
  };
}

export default view(Permission);
