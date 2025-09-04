import React, {useEffect, useState} from 'react';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import RegJournalTable from 'docs/templates/docs/contracts/registration_journal/table';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {getIndexByProperty, notify} from 'templates/components/my_extras';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import Selector from 'templates/components/form_modules/selectors/selector';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {getCompanyCode, getNextSequenceNumber, getTypeCode} from 'templates/components/auto_contract_registration';

function ContractsRegJournal() {
  const [modalOpened, setModalOpened] = useState(false);
  const [editedToggle, setEditedToggle] = useState(false);
  const [regInfo, setRegInfo] = useState({
    id: 0,
    type: '',
    manual_number: '',
    auto_number: '',
    sequence_number: '',
    date: '',
    company: '',
    counterparty_id: 0,
    counterparty_name: '',
    subject: '',
    responsible_id: 0,
    responsible_name: '',
    contract_id: 0
  });
  const [autoTypeCode, setAutoTypeCode] = useState('');
  const [autoCompanyCode, setAutoCompanyCode] = useState('');
  const [autoNumberMode, setAutoNumberMode] = useState(true);

  useEffect(() => {
    if (autoNumberMode && regInfo.type && regInfo.company && regInfo.date) {
      getNextSequenceNumber(regInfo.type, regInfo.company, regInfo.date.slice(0, 4)).then((response) => {
        if (response) {
          setRegInfo((prevState) => ({
            ...prevState,
            auto_number: `${autoTypeCode}-${response}-${autoCompanyCode}${regInfo.date.slice(2, 4)}`,
            sequence_number: response
          }));
        } else notify('Щось пішло не так. Зверніться до адміністратора');
      });
      // getNextSequenceNumber();
    }
  }, [editedToggle]);

  function clearAutoNumber() {
    setRegInfo((prevState) => ({
      ...prevState,
      auto_number: '',
      sequence_number: ''
    }));
    setAutoNumberMode(false);
  }

  function openModal(clicked_row = {id: 0, number: '', date: ''}) {
    const clicked = {...clicked_row};
    if (clicked.date) {
      const parts = clicked.date.split('.');
      clicked.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    setRegInfo(clicked);
    setModalOpened(true);

    setAutoTypeCode(getTypeCode(clicked_row.type));
    setAutoCompanyCode(getCompanyCode(clicked_row.company));
  }

  function onCloseModal() {
    setModalOpened(false);
    setRegInfo({
      id: 0,
      type: '',
      manual_number: '',
      auto_number: '',
      sequence_number: '',
      date: '',
      company: '',
      counterparty_id: 0,
      counterparty_name: '',
      subject: '',
      responsible_id: 0,
      responsible_name: ''
    });
    setAutoTypeCode('');
    setAutoCompanyCode('');
    setAutoNumberMode(true);
  }

  function onFieldChange(e, field_name) {
    setRegInfo((prevState) => ({
      ...prevState,
      [field_name]: e.target.value
    }));
  }

  function onDateChange(e) {
    setRegInfo((prevState) => ({
      ...prevState,
      date: e.target.value
    }));

    setEditedToggle(!editedToggle);
  }

  function onTypeChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setRegInfo((prevState) => ({
      ...prevState,
      type: e.target.options[selectedIndex].value
    }));

    setAutoTypeCode(getTypeCode(e.target.options[selectedIndex].value));

    setEditedToggle(!editedToggle);
  }

  function onCompanyChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setRegInfo((prevState) => ({
      ...prevState,
      company: e.target.options[selectedIndex].value
    }));

    setAutoCompanyCode(getCompanyCode(e.target.options[selectedIndex].value));

    setEditedToggle(!editedToggle);
  }

  function onCounterpartyChange(e) {
    setRegInfo((prevState) => ({
      ...prevState,
      counterparty_id: e.id,
      counterparty_name: e.name
    }));
  }

  function onResponsibleChange(e) {
    setRegInfo((prevState) => ({
      ...prevState,
      responsible_id: e.id,
      responsible_name: e.name
    }));
  }

  function postChanges(e) {
    let formData = new FormData();
    formData.append('auto_number', regInfo.auto_number);
    formData.append('sequence_number', regInfo.sequence_number || '');
    formData.append('manual_number', regInfo.manual_number || '');
    formData.append('type', regInfo.type);
    formData.append('date', regInfo.date);
    formData.append('company', regInfo.company);
    formData.append('counterparty_id', regInfo.counterparty_id);
    formData.append('subject', regInfo.subject);
    formData.append('responsible_id', regInfo.responsible_id);

    axiosPostRequest('edit_reg_journal_number/' + regInfo.id + '/', formData)
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => notify(error));
  }

  function deleteReg(e) {
    axiosGetRequest('delete_reg_journal_number/' + regInfo.id + '/')
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => notify(error));
  }

  return (
    <>
      <RegJournalTable onRowClick={openModal} />
      <Modal open={modalOpened} onClose={onCloseModal} showCloseIcon={true} closeOnOverlayClick={true} styles={{modal: {marginTop: 75}}}>
        <div className='modal-header'>{`${regInfo.id ? 'Редагування' : 'Додавання'} реєстраційного номеру договору`}</div>
        <div className='modal-body'>
          <div className='d-flex'>
            <TextInput
              text={regInfo.manual_number ? regInfo.manual_number : regInfo.auto_number}
              fieldName='Реєстраційний номер договору'
              onChange={(e) => onFieldChange(e, 'manual_number')}
              maxLength={20}
              disabled={autoNumberMode}
            />
            <button className='btn btn-sm btn-outline-dark ml-2 my-2' onClick={clearAutoNumber}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
          <Selector
            list={[
              {id: 1, company: 'ТДВ'},
              {id: 2, company: 'ТОВ'},
              {id: 3, company: 'NorthlandChem'}
            ]}
            selectedName={regInfo.company}
            valueField={'company'}
            fieldName={'Підприємство'}
            onChange={onCompanyChange}
            disabled={false}
          />
          <SelectorWithFilterAndAxios
            listNameForUrl='counterparties'
            fieldName='Контрагент'
            selectId='counterparty_select'
            value={{name: regInfo.counterparty_name, id: regInfo.counterparty_id}}
            onChange={onCounterpartyChange}
            disabled={false}
          />
          <Selector
            list={[
              {id: 1, type: 'Закупівля лісу'},
              {id: 2, type: 'Купівля-продаж'},
              {id: 3, type: 'Перевезення'},
              {id: 4, type: 'Послуги та інше'}
            ]}
            selectedName={regInfo.type}
            valueField={'type'}
            fieldName={'Тип'}
            onChange={onTypeChange}
            disabled={false}
          />
          <TextInput
            text={regInfo.subject}
            fieldName='Предмет договору'
            onChange={(e) => onFieldChange(e, 'subject')}
            maxLength={20}
            disabled={false}
          />
          <DateInput fieldName='Дата договору' date={regInfo.date} disabled={false} onChange={onDateChange} />
          <SelectorWithFilterAndAxios
            listNameForUrl='userprofiles'
            fieldName='Відповідальний менеджер'
            selectId='responsible_select'
            value={{name: regInfo.responsible_name, id: regInfo.responsible_id}}
            onChange={onResponsibleChange}
            disabled={false}
          />
          <If condition={regInfo.contract_id}>
            <hr />
            <a href={`${window.location.origin}/docs/contracts/${regInfo.contract_id}`} target='_blank'>
              <h6>Переглянути договір</h6>
            </a>
          </If>
          <If condition={regInfo.additionals_for_card}>
            Додаткові угоди:
            <ul>
              <For each='additional' of={regInfo.additionals_for_card} index='index'>
                <a href={`${window.location.origin}/docs/contracts/${additional.id}`} target='_blank'>
                  <h6>{additional.name}</h6>
                </a>
              </For>
            </ul>
          </If>
        </div>
        <div className='modal-footer'>
          <SubmitButton
            className='btn-outline-primary'
            text='Зберегти'
            onClick={postChanges}
            disabled={
              (!regInfo.auto_number && !regInfo.manual_number) ||
              !regInfo.type ||
              regInfo.type === '0' ||
              !regInfo.date ||
              !regInfo.counterparty_id ||
              !regInfo.subject ||
              !regInfo.responsible_id ||
              !regInfo.company ||
              regInfo.company === '0'
            }
          />
          <SubmitButton className='btn-outline-danger' text='Видалити' onClick={deleteReg} disabled={false} />
        </div>
      </Modal>
    </>
  );
}

export default ContractsRegJournal;
