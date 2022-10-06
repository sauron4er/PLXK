'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import {useState} from 'react';
import counterpartyLettersStore from 'boards/templates/boards/counterparty/components/letters/store';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import DateInput from 'templates/components/form_modules/date_input';

function Letter(props) {
  const [request_sent, setRequestSent] = useState(false);

  function onNameChange(e) {
    counterpartyLettersStore.letter.name = e.target.value;
  }

  function onTextChange(e) {
    counterpartyLettersStore.letter.text = e.target.value;
  }

  function onDateChange(e) {
    counterpartyLettersStore.letter.date = e.target.value;
  }

  function onCounterpartyMailChange(e) {
    counterpartyLettersStore.letter.counterparty_mail = e.target.value;
  }

  function onCommentChange(e) {
    counterpartyLettersStore.letter.comment = e.target.value;
  }

  function onFilesChange(e) {
    counterpartyLettersStore.letter.new_files = e.target.value;
  }

  function onFilesDelete(id) {
    // Необхідно проводити зміни через додаткову перемінну,
    // бо react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...counterpartyLettersStore.letter.old_files];
    for (const i in old_files) {
      if (old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    counterpartyLettersStore.letter.old_files = [...old_files];
  }

  function postLetter() {
    setRequestSent(true);

    let formData = new FormData();
    formData.append('letter', JSON.stringify(counterpartyLettersStore.letter));
    formData.append('counterparty_id', JSON.stringify(props.counterparty_id));
    formData.append('old_files', JSON.stringify(counterpartyLettersStore.letter.old_files));

    if (counterpartyLettersStore.letter.new_files?.length) {
      counterpartyLettersStore.letter.new_files.map((file) => {
        formData.append('new_files', file);
      });
    }

    axiosPostRequest('post_letter', formData)
      .then((response) => {
        props.reloadLetters();
        setRequestSent(false);
      })
      .catch((error) => {
        setRequestSent(false);
        notify('Не вдалося зберегти, зверніться до адміністратора');
      });
  }

  function delLetter() {
    let formData = new FormData();
    formData.append('id', JSON.stringify(counterpartyLettersStore.letter.id));

    axiosPostRequest('del_letter', formData)
      .then((response) => {
        props.reloadLetters();
      })
      .catch((error) => {
        notify('Не вдалося видалити, зверніться до адміністратора');
      });
  }

  function fieldsAreValid() {
    const {name, date, counterparty_mail} = counterpartyLettersStore.letter;

    const name_valid = !!name;
    const date_valid = !!date;
    const counterparty_mail_valid = !!counterparty_mail;

    const file_added = counterpartyLettersStore.letter.new_files.length || counterpartyLettersStore.letter.old_files.length;

    return name_valid && date_valid && counterparty_mail_valid && file_added;
  }

  return (
    <>
      <h5 className='mt-2'>
        <Choose>
          <When condition={counterpartyLettersStore.letter.id === 0}>Новий лист</When>
          <Otherwise>
            <div className='d-flex justify-content-between'>
              <div>Редагування листа</div>
              <button className='btn btn-sm btn-outline-primary' onClick={counterpartyLettersStore.clearLetter}>
                Додати лист
              </button>
            </div>
          </Otherwise>
        </Choose>
      </h5>
      <hr />
      <TextInput
        text={counterpartyLettersStore.letter.name}
        fieldName={'* Предмет'}
        onChange={onNameChange}
        maxLength={100}
        disabled={!window.edit_access}
      />
      <TextInput
        text={counterpartyLettersStore.letter.text}
        fieldName={'Текст листа'}
        onChange={onTextChange}
        maxLength={1000}
        disabled={!window.edit_access}
      />
      <DateInput
        date={counterpartyLettersStore.letter.date}
        fieldName={'* Дата'}
        onChange={onDateChange}
        disabled={!window.edit_access}
        className='mb-1'
      />
      <TextInput
        text={counterpartyLettersStore.letter.counterparty_mail}
        fieldName={'* Пошта адресата'}
        onChange={onCounterpartyMailChange}
        maxLength={50}
        disabled={!window.edit_access}
      />
      <TextInput
        text={counterpartyLettersStore.letter.comment}
        fieldName={'Коментар'}
        onChange={onCommentChange}
        maxLength={1000}
        disabled={!window.edit_access}
      />
      <hr />
      <Files
        oldFiles={counterpartyLettersStore.letter.old_files}
        newFiles={counterpartyLettersStore.letter.new_files}
        fieldName={'Файли'}
        onChange={onFilesChange}
        onDelete={onFilesDelete}
        disabled={!window.edit_access}
      />
      <hr />
      <If condition={window.edit_access}>
        <div className='d-flex justify-content-between'>
          <SubmitButton className='btn-info' text='Зберегти' onClick={postLetter} disabled={!fieldsAreValid()} requestSent={request_sent} />
          <If condition={counterpartyLettersStore.letter.id !== 0}>
            <SubmitButton className='btn-outline-danger' text='Видалити' onClick={delLetter} />
          </If>
        </div>
      </If>
    </>
  );
}

Letter.defaultProps = {
  counterparty_id: 0,
  reloadLetters: () => {}
};

export default view(Letter);
