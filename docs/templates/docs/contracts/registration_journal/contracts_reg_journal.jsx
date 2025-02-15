import React, {useState} from 'react';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import RegJournalTable from 'docs/templates/docs/contracts/registration_journal/table';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from "templates/components/form_modules/submit_button";
import { getIndexByProperty, notify } from "templates/components/my_extras";
import { axiosGetRequest, axiosPostRequest } from "templates/components/axios_requests";

function ContractsRegJournal() {
  const [modalOpened, setModalOpened] = useState(false);
  const [regNumber, setRegNumber] = useState({id: 0, number: '', date: ''});

  function openModal(clicked_row = {id: 0, number: '', date: ''}) {
    const clicked = {...clicked_row}
    if (clicked.date) {
      const parts =clicked.date.split('.');
      clicked.date = `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    setRegNumber(clicked);
    setModalOpened(true);
  }

  function onNumberChange(e) {
    setRegNumber((prevState) => ({
      ...prevState,
      number: e.target.value
    }));
  }

  function onDateChange(e) {
    setRegNumber((prevState) => ({
      ...prevState,
      date: e.target.value
    }));
  }

  function postChanges(e) {
    let formData = new FormData();
      formData.append('number', regNumber.number);
      formData.append('date', regNumber.date);

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

  return (
    <>
      <div className='btn btn-sm btn-outline-secondary mt-1' onClick={e => openModal()}>
        Додати
      </div>
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
            onChange={onNumberChange}
            maxLength={20}
            disabled={false}
          />
          <DateInput fieldName='Дата договору' date={regNumber.date} disabled={false} onChange={onDateChange} />
        </div>
        <div className='modal-footer'>
          <SubmitButton className='btn-outline-primary' text='Зберегти' onClick={postChanges} disabled={!regNumber.number || !regNumber.date} />
          <SubmitButton className='btn-outline-danger' text='Видалити' onClick={deleteReg} disabled={false} />
        </div>
      </Modal>
    </>
  );
}

export default ContractsRegJournal;
