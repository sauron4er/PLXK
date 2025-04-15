'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import Selector from 'templates/components/form_modules/selectors/selector';
import { useEffect, useState } from "react";
import { getCompanyCode, getTypeCode } from "templates/components/auto_contract_registration";

function RegistrationModal(props) {
  const [type, setType] = useState(null);

  function onSubmit() {
    props.onSubmit();
  }

  function onClose() {
    props.onCloseModal();
  }

  function onRegChange(e) {
    docInfoStore.info.registration_number = e.target.value;
  }

  function onTypeChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setType(e.target.options[selectedIndex].value)
  }

  useEffect(() => {
    if (type) arrangeAutoRegistration()
  }, [type]);

  function arrangeAutoRegistration() {
    const type_code = getTypeCode(type)
    const company_code = getCompanyCode(docInfoStore.info.company)
    const year = new Date().getFullYear().toString().slice(0, 4)
    console.log(type_code);
    console.log(company_code);
    console.log(year);

  }

  return (
    <>
      <div className='modal-header d-flex justify-content-between'>
        <h5 className='modal-title font-weight-bold'>Реєстрація документа</h5>
        <button className='btn btn-link' onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className='modal-body'>
        <Selector
          list={[
            {id: 1, type: 'Закупівля лісу'},
            {id: 2, type: 'Купівля-продаж'},
            {id: 3, type: 'Перевезення'},
            {id: 4, type: 'Послуги та інше'}
          ]}
          selectedName={type}
          valueField={'type'}
          fieldName={'Тип'}
          onChange={onTypeChange}
          disabled={false}
        />
        <label htmlFor='registration_modal'>Реєстраційний номер:</label>
        <input
          className='form-control mr-1'
          name='registration'
          id='registration_modal'
          value={docInfoStore.info.registration_number}
          onChange={onRegChange}
          maxLength={50}
        />
      </div>
      <div className='modal-footer'>
        <button className='btn btn-outline-info' onClick={onSubmit}>
          Зберегти
        </button>
      </div>
    </>
  );
}

RegistrationModal.defaultProps = {
  onCloseModal: () => {},
  onSubmit: () => {}
};

export default view(RegistrationModal);
