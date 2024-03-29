'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import {useEffect, useState} from 'react';
import proposalsStore from 'boards/templates/boards/proposals/proposals_store';
import CheckboxInput from 'templates/components/form_modules/checkbox_input';

function Proposal() {
  const [dataReceived, setDataReceived] = useState(false);

  useEffect(() => {
    if (proposalsStore.clicked_row_id !== 0) {
      getProposal();
    } else {
      setDataReceived(true);
    }
  }, []);

  function getProposal() {
    axiosGetRequest('get_proposal/' + proposalsStore.clicked_row_id + '/')
      .then((response) => {
        proposalsStore.proposal = response;
        setDataReceived(true);
      })
      .catch((error) => notify(error));
  }

  function areAllFieldsFilled() {
    const {proposal} = proposalsStore;
    if (isBlankOrZero(proposal.name)) {
      notify('Заповніть поле "Коротка назва"');
      return false;
    }
    if (isBlankOrZero(proposal.text)) {
      notify('Заповніть поле "Пропозиція"');
      return false;
    }
    if (isBlankOrZero(proposal.responsible)) {
      notify('Оберіть відповідального за виконання');
      return false;
    }
    return true;
  }

  function areDatesInOrder() {
    if (proposalsStore.proposal.deadline) {
      const today = new Date();
      const deadline_date = new Date(proposalsStore.proposal.deadline);
      if (today > deadline_date) {
        notify('Строк виконання не може бути раніше за сьогодні');
        return false;
      }
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
          window.location.reload();
        })
        .catch((error) => notify(error));
    }
  }

  function postDelProposal() {
    axiosPostRequest('deactivate_proposal/' + proposalsStore.clicked_row_id + '/')
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => notify(error));
  }

  function onNameChange(e) {
    proposalsStore.proposal.name = e.target.value;
  }

  function onTextChange(e) {
    proposalsStore.proposal.text = e.target.value;
  }

  function onResponsibleChange(e) {
    proposalsStore.proposal.responsible = e.id;
    proposalsStore.proposal.responsible_name = e.name;
  }

  function onDeadlineChange(e) {
    proposalsStore.proposal.deadline = e.target.value;
  }

  function onIncidentChange(e) {
    proposalsStore.proposal.incident = e.target.value;
  }

  function onIncidentDateChange(e) {
    proposalsStore.proposal.incident_date = e.target.value;
  }

  function onDoneChange(e) {
    proposalsStore.proposal.is_done = !proposalsStore.proposal.is_done;
  }

  return (
    <div className='shadow-lg p-3 mb-5 bg-white rounded min-vh-100'>
      <Choose>
        <When condition={dataReceived}>
          <div className='modal-header'>
            <h5>{proposalsStore.clicked_row_id !== 0 ? 'Перегляд пропозиції' : 'Нова пропозиція'}</h5>
            <small>Поля, позначені зірочкою, є обов’язковими</small>
          </div>
          <div className='modal-body'>
            <TextInput
              text={proposalsStore.proposal.name}
              fieldName={'* Коротка назва'}
              onChange={onNameChange}
              maxLength={200}
              disabled={!proposalsStore.proposal.editing_allowed}
            />
            <hr />
            <TextInput
              text={proposalsStore.proposal.text}
              fieldName={'* Пропозиція'}
              onChange={onTextChange}
              maxLength={5000}
              disabled={!proposalsStore.proposal.editing_allowed}
            />
            <hr />
            <TextInput
              text={proposalsStore.proposal.incident}
              fieldName={'Випадок'}
              onChange={onIncidentChange}
              maxLength={5000}
              disabled={!proposalsStore.proposal.editing_allowed}
            />
            <hr />
            <DateInput
              date={proposalsStore.proposal.incident_date}
              fieldName={'Дата випадку'}
              onChange={onIncidentDateChange}
              disabled={!proposalsStore.proposal.editing_allowed}
            />
            <hr />
            <SelectorWithFilterAndAxios
              listNameForUrl='userprofiles'
              fieldName='* Відповідальний за виконання'
              selectId='responsible_select'
              value={{name: proposalsStore.proposal.responsible_name, id: proposalsStore.proposal.responsible}}
              onChange={onResponsibleChange}
              disabled={!proposalsStore.proposal.editing_allowed}
            />
            <hr />
            <div className='d-flex justify-content-between'>
              <DateInput
                date={proposalsStore.proposal.deadline}
                fieldName={'Строк перевірки виконання'}
                onChange={onDeadlineChange}
                disabled={!proposalsStore.proposal.editing_allowed}
              />
              <div className={`p-2 rounded ${proposalsStore.proposal.is_done ? 'bg-success' : 'bg-danger'}`}>
                <CheckboxInput
                  checked={proposalsStore.proposal.is_done}
                  fieldName={proposalsStore.proposal.is_done ? 'Виконано' : 'Не виконано'}
                  onChange={onDoneChange}
                  disabled={!proposalsStore.proposal.editing_allowed}
                />
              </div>
            </div>
          </div>
          <If condition={proposalsStore.proposal.editing_allowed}>
            <div className='modal-footer'>
              <If condition={proposalsStore.clicked_row_id !== 0}>
                <SubmitButton className='btn-outline-danger' onClick={() => postDelProposal()} text='Видалити' />
              </If>
              <SubmitButton
                className='btn btn-outline-info'
                onClick={() => postProposal()}
                text='Зберегти'
                disabled={!proposalsStore.proposal.name || !proposalsStore.proposal.text || !proposalsStore.proposal.responsible}
              />
            </div>
          </If>

          {/*Вспливаюче повідомлення*/}
          <ToastContainer />
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    </div>
  );
}

Proposal.defaultProps = {
  id: 0
};

export default view(Proposal);
