'use strict';
import React, {useState, useEffect} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import Modal from 'react-responsive-modal';
import MultiSelectorWithAxios from 'templates/components/form_modules/selectors/multi_selector_with_axios';

function ReclamationFirstPhase() {
  const [editable, setEditable] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const {reclamation, onFormChange} = reclamationsStore;

  useEffect(() => {
    setEditable(reclamation.phase < 2 && ['author', 'dep_chief', 'director'].includes(reclamationsStore.user_role));
  }, []);

  function onProductTypeChange(e) {
    reclamation.product_type = e.id;
    reclamation.product_type_name = e.name;
  }

  function onProductChange(e) {
    reclamation.product = e.id;
    reclamation.product_name = e.name;
  }

  function onClientChange(e) {
    reclamation.client = e.id;
    reclamation.client_name = e.name;
  }

  function onFilesChange(e) {
    reclamation.new_files = e.target.value;
  }

  function areFirstPhaseFieldsFilled() {
    const first_phase_fields = {
      product_type: 'Вид продукції',
      product: 'Продукція',
      date_manufacture: 'Дата виробництва',
      date_shipment: 'Дата відвантаження',
      date_received: 'Дата отримання',
      client: 'Клієнт',
      car_number: 'Номер автомобіля',
      reason: 'Причина невідповідності'
    };

    for (const [key, value] of Object.entries(first_phase_fields)) {
      if (isBlankOrZero(reclamation[key])) {
        notify(`Заповніть поле "${value}"`);
        return false;
      }
    }

    if (isBlankOrZero(reclamation.new_files) && isBlankOrZero(reclamation.old_files)) {
      notify(`Додайте фото чи документи`);
      return false;
    }

    return true;
  }

  function postReclamation() {
    if (areFirstPhaseFieldsFilled()) {
      let formData = new FormData();
      formData.append('reclamation', JSON.stringify(reclamation));
      if (reclamation.new_files?.length > 0) {
        reclamation.new_files.map((file) => {
          formData.append('new_files', file);
        });
      }

      axiosPostRequest('post_reclamation', formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => notify(error));
    }
  }

  function openDecisionsModal() {
    setDecisionModalOpen(true);
  }

  function postDepChiefApproval(approved) {
    const {id, decisions} = reclamation;

    let formData = new FormData();
    formData.append('reclamation_id', id);
    formData.append('approved', approved);
    formData.append('decisions', decisions ? JSON.stringify(decisions) : JSON.stringify([]));

    axiosPostRequest('dep_chief_approval', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  }

  function onCloseModal() {
    setDecisionModalOpen(false);
  }

  function onAcquaintsChange(list) {
    reclamation.decisions = list;
  }

  return (
    <div>
      <NCRow>
        <NCItem cols='4' className='d-flex'>
          <SelectorWithFilterAndAxios
            listNameForUrl='product_types_flat/sell'
            fieldName='Вид продукції'
            selectId='product_type_select'
            value={{name: reclamation.product_type_name, id: reclamation.product_type}}
            onChange={onProductTypeChange}
            disabled={!editable}
          />
        </NCItem>
        <NCItem cols='4'>
          <SelectorWithFilterAndAxios
            listNameForUrl={`products/${reclamation.product_type}`}
            fieldName='Продукція'
            selectId='product_select'
            value={{name: reclamation.product_name, id: reclamation.product}}
            onChange={onProductChange}
            disabled={!editable}
          />
        </NCItem>
        <NCItem cols='4'>
          Ініціатор:
          <div className='font-weight-bold'>{reclamation.id ? reclamation.author_name : user_name}</div>
        </NCItem>
      </NCRow>

      <NCRow>
        <NCItem cols='2'>
          <DateInput
            fieldName='Дата виробництва'
            date={reclamation.date_manufacture}
            disabled={!editable}
            onChange={(e) => onFormChange(e, 'date_manufacture')}
          />
        </NCItem>
        <NCItem cols='2'>
          <DateInput
            fieldName='Дата відвантаження'
            date={reclamation.date_shipment}
            disabled={!editable}
            onChange={(e) => onFormChange(e, 'date_shipment')}
          />
        </NCItem>
        <NCItem cols='4' className='d-flex'>
          <DateInput
            fieldName='Дата отримання рекламації'
            date={reclamation.date_received}
            disabled={!editable}
            onChange={(e) => onFormChange(e, 'date_received')}
          />
        </NCItem>
        <NCItem cols='4' style={reclamation.dep_chief_approved === '' ? {background: 'Cornsilk'} : null}>
          Віза начальника підрозділу:
          <div className='font-weight-bold'>{reclamation.dep_chief_name}</div>
          <Choose>
            <When condition={reclamation.dep_chief_approved === true}>
              <div className='border border-success rounded p-1 mt-1 text-center text-success font-weight-bold'>Погоджено</div>
            </When>
            <When condition={reclamation.dep_chief_approved === false}>
              <div className='border border-danger rounded p-1 mt-1 text-center text-danger font-weight-bold'>Відмовлено</div>
            </When>
            <Otherwise>
              <If condition={reclamation.phase === 1 && reclamationsStore.user_role === 'dep_chief'}>
                <SubmitButton className='btn-info' text='Погодити' onClick={openDecisionsModal} />
                <SubmitButton className='btn-danger ml-1' text='Відмовити' onClick={(e) => postDepChiefApproval(false)} />
              </If>
            </Otherwise>
          </Choose>
        </NCItem>
      </NCRow>
      
      <NCRow>
        <NCItem cols='8'>
          <SelectorWithFilterAndAxios
            listNameForUrl='clients'
            fieldName='Клієнт'
            selectId='client_select'
            value={{name: reclamation.client_name, id: reclamation.client}}
            onChange={onClientChange}
            disabled={!editable}
          />
        </NCItem>
        <NCItem cols='4'>
          <TextInput
            fieldName='Номер автомобіля'
            text={reclamation.car_number}
            maxLength={10}
            disabled={!editable}
            onChange={(e) => onFormChange(e, 'car_number')}
          />
        </NCItem>
      </NCRow>
      
      <NCRow>
        <NCItem cols='8'>
          <TextInput
            fieldName='Причина рекламації'
            text={reclamation.reason}
            maxLength={300}
            disabled={!editable}
            onChange={(e) => onFormChange(e, 'reason')}
          />
        </NCItem>
        <NCItem cols='4'>
          <Files
            oldFiles={reclamation.old_files}
            newFiles={reclamation.new_files}
            fieldName='Фото чи документи'
            onChange={onFilesChange}
            onDelete={() => {}} // TODO зробити onDelete
            disabled={!editable}
          />
        </NCItem>
      </NCRow>
      
      <If condition={reclamation.phase < 2 && ['author', 'dep_chief'].includes(reclamationsStore.user_role)}>
        <NCRow>
          <NCItem>
            <SubmitButton className='btn-info' text='Зберегти' onClick={postReclamation} />
          </NCItem>
        </NCRow>
      </If>
      
      <Modal
        open={decisionModalOpen}
        onClose={onCloseModal}
        showCloseIcon={false}
        closeOnOverlayClick={false}
        styles={{modal: {marginTop: 100, height: '45%'}}}
      >
        Оберіть членів комісії по роботі з рекламацією.
        <MultiSelectorWithAxios listNameForUrl='employees' onChange={onAcquaintsChange} disabled={!editable} />
        <If condition={reclamation.decisions.length > 0}>
          <SubmitButton className='btn-info' text='Зберегти' onClick={(e) => postDepChiefApproval(true)} />
        </If>
      </Modal>
    </div>
  );
}

export default view(ReclamationFirstPhase);
