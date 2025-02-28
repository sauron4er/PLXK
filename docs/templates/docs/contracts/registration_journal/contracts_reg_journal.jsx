import React, {useState} from 'react';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import RegJournalTable from 'docs/templates/docs/contracts/registration_journal/table';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {getIndexByProperty, notify} from 'templates/components/my_extras';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import Selector from 'templates/components/form_modules/selectors/selector';
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";

function ContractsRegJournal() {
  const [modalOpened, setModalOpened] = useState(false);
  const [regNumber, setRegNumber] = useState({
    id: 0,
    number: '',
    type: '',
    date: '',
    counterparty_id: 0,
    counterparty_name: '',
    subject: '',
    responsible_id: 0,
    responsible_name: ''
  });

  function openModal(clicked_row = {id: 0, number: '', date: ''}) {
    const clicked = {...clicked_row};
    if (clicked.date) {
      const parts = clicked.date.split('.');
      clicked.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    setRegNumber(clicked);
    setModalOpened(true);
  }

  function onFieldChange(e, field_name) {
    setRegNumber((prevState) => ({
      ...prevState,
      [field_name]: e.target.value
    }));
  }

  function onTypeChange(e) {
    const selectedIndex = e.target.options.selectedIndex;
    setRegNumber((prevState) => ({
      ...prevState,
      type: e.target.options[selectedIndex].value
    }));
  }

  function onCounterpartyChange(e) {
    setRegNumber((prevState) => ({
      ...prevState,
      counterparty_id: e.id,
      counterparty_name: e.name
    }));
  }

  function onResponsibleChange(e) {
    setRegNumber((prevState) => ({
      ...prevState,
      responsible_id: e.id,
      responsible_name: e.name
    }));
  }

  function postChanges(e) {
    let formData = new FormData();
    formData.append('number', regNumber.number);
    formData.append('type', regNumber.type);
    formData.append('date', regNumber.date);
    formData.append('counterparty_id', regNumber.counterparty_id);
    formData.append('subject', regNumber.subject);
    formData.append('responsible_id', regNumber.responsible_id);

    axiosPostRequest('edit_reg_journal_number/' + regNumber.id + '/', formData)
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => notify(error));
  }

  function deleteReg(e) {
    axiosGetRequest('delete_reg_journal_number/' + regNumber.id + '/')
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => notify(error));
  }

  console.log(regNumber.type);

  return (
    <>
      <If condition={window.edit_access}>
        <div className='btn btn-sm btn-outline-secondary mt-1' onClick={(e) => openModal()}>
          Додати
        </div>
      </If>
      <RegJournalTable onRowClick={openModal} />
      <Modal
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 75}}}
      >
        <div className='modal-header'>{`${regNumber.id ? 'Редагування' : 'Додавання'} реєстраційного номеру договору`}</div>
        <div className='modal-body'>
          <TextInput
            text={regNumber.number}
            fieldName='Реєстраційний номер договору'
            onChange={(e) => onFieldChange(e, 'number')}
            maxLength={20}
            disabled={false}
          />
          <SelectorWithFilterAndAxios
            listNameForUrl='counterparties'
            fieldName='Контрагент'
            selectId='counterparty_select'
            value={{name: regNumber.counterparty_name, id: regNumber.counterparty_id}}
            onChange={onCounterpartyChange}
            disabled={false}
          />
          <Selector
            list={[
              {id: 1, type: 'Купівля-продаж'},
              {id: 2, type: 'Перевезення'},
              {id: 3, type: 'Послуги та інше'}
            ]}
            selectedName={regNumber.type}
            valueField={'type'}
            fieldName={'Тип'}
            onChange={onTypeChange}
            disabled={false}
          />
          <TextInput
            text={regNumber.subject}
            fieldName='Предмет договору'
            onChange={(e) => onFieldChange(e, 'subject')}
            maxLength={20}
            disabled={false}
          />
          <DateInput fieldName='Дата договору' date={regNumber.date} disabled={false} onChange={(e) => onFieldChange(e, 'date')} />
          <SelectorWithFilterAndAxios
            listNameForUrl='userprofiles'
            fieldName='Відповідальний менеджер'
            selectId='responsible_select'
            value={{name: regNumber.responsible_name, id: regNumber.responsible_id}}
            onChange={onResponsibleChange}
            disabled={false}
          />
        </div>
        <div className='modal-footer'>
          <SubmitButton
            className='btn-outline-primary'
            text='Зберегти'
            onClick={postChanges}
            disabled={!regNumber.number || !regNumber.type || regNumber.type === '0' || !regNumber.date || !regNumber.counterparty_id || !regNumber.subject || !regNumber.responsible_id}
          />
          <SubmitButton className='btn-outline-danger' text='Видалити' onClick={deleteReg} disabled={false} />
        </div>
      </Modal>
    </>
  );
}

export default ContractsRegJournal;
