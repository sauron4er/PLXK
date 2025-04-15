'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/files_uploader.css';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/doc_info_store';
import Selector from 'templates/components/form_modules/selectors/selector';
import {useEffect, useState} from 'react';
import {getCompanyCode, getNextSequenceNumber, getTypeCode} from 'templates/components/auto_contract_registration';
import { axiosGetRequest, axiosPostRequest } from "templates/components/axios_requests";

function RegistrationModal(props) {
  const [type, setType] = useState(null);
  const [nextSequenceNumber, setNextSequenceNumber] = useState(null);
  const [lastTenNumbers, setLastTenNumbers] = useState(null);

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
    setType(e.target.options[selectedIndex].value);
    if (e.target.options[selectedIndex].value === '0') setNextSequenceNumber(null)
  }

  useEffect(() => {
    if (type) {
      if (type === '0') docInfoStore.info.registration_number = '';
      else arrangeAutoRegistration().then((r) => {});
    }
  }, [type]);

  async function arrangeAutoRegistration() {
    const year = new Date().getFullYear();
    const nextSeqNumber = await getNextSequenceNumber(type, docInfoStore.info.company, year);

    const type_code = getTypeCode(type);
    const company_code = getCompanyCode(docInfoStore.info.company);
    const year_code = new Date().getFullYear().toString().slice(2, 4);
    docInfoStore.info.registration_number = `${type_code}-${nextSeqNumber}-${company_code}${year_code}`;

    setNextSequenceNumber(nextSeqNumber)
  }

  function getLastTenNumbers() {
    const year = new Date().getFullYear();

    let formData = new FormData();
    formData.append('type', type);
    formData.append('company', docInfoStore.info.company);
    formData.append('year', year);

    axiosPostRequest(`get_last_ten_reg_numbers/`, formData)
      .then((response) => {
        setLastTenNumbers(response)
      })
      .catch((error) => console.log(error));
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
        <If condition={nextSequenceNumber}>
          <div className='mt-1'><a href="#" onClick={getLastTenNumbers}>Переглянути останні 10 номерів</a></div>
        </If>
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
