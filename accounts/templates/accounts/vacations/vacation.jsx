'use strict';
import React, {useEffect, useState} from 'react';
import {notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';

function Vacation(props) {
  const [request_sent, setRequestSent] = useState(false);
  const [id, setId] = useState(0);
  const [begin, setBegin] = useState('');
  const [end, setEnd] = useState('');
  const [actingId, setActingId] = useState(0);
  const [actingName, setActingName] = useState('');
  const [employeeId, setEmployeeId] = useState(0);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    if (props.vacation?.id !== 0) {
      setId(props.vacation.id);
      setBegin(props.vacation.begin);
      setEnd(props.vacation.end);
      setActingId(props.vacation.acting_id);
      setActingName(props.vacation.acting_name);
      setEmployeeId(props.vacation.employee_id);
      setEmployeeName(props.vacation.employee_name);
    } else {
      setId(0);
      setBegin('');
      setEnd('');
      setActingId(0);
      setActingName('');
      setEmployeeId(0);
      setEmployeeName('');
    }
  }, [props.vacation]);

  function onActingChange(e) {
    setActingId(e.id);
    setActingName(e.name);
  }

  function onEmployeeChange(e) {
    setEmployeeId(e.id);
    setEmployeeName(e.name);
  }

  function fieldsAreValid() {
    const dates_not_empty = !!begin.length && !!end.length;
    const end_is_later_than_begin = begin < end;
    const acting_selected = actingId !== 0;

    return dates_not_empty && end_is_later_than_begin && acting_selected;
  }

  function postVacation() {
    setRequestSent(true);

    let formData = new FormData();
    formData.append('id', id);
    formData.append('begin', begin);
    formData.append('end', end);
    formData.append('employee_id', employeeId);
    formData.append('acting_id', actingId);

    axiosPostRequest('edit_vacation', formData)
      .then((response) => {
        if (response === 'ok') {
          props.reloadVacations();
          clearFields();
          setRequestSent(false);
        }
      })
      .catch((error) => {
        setRequestSent(false);
        notify('Не вдалося зберегти, зверніться до адміністратора');
      });
  }

  function clearFields() {
    setId(0);
    setBegin('');
    setEnd('');
    setActingId(0);
    setActingName('');
  }

  function delVacation() {
    let formData = new FormData();
    formData.append('id', id);

    axiosPostRequest('del_vacation', formData)
      .then((response) => {
        props.reloadVacations();
        clearFields();
      })
      .catch((error) => {
        notify('Не вдалося видалити, зверніться до адміністратора');
      });
  }

  return (
    <>
      <h5>Нова відпустка / редагування відпустки</h5>
      <hr />
      <div className='d-flex'>
        <DateInput fieldName='Дата початку' date={begin} disabled={false} onChange={(e) => setBegin(e.target.value)} />
        <DateInput fieldName='Дата кінця' date={end} disabled={false} onChange={(e) => setEnd(e.target.value)} className='ml-3' />
      </div>
      <hr />
      <If condition={window.is_admin || window.is_hr}>
        <hr />
        <SelectorWithFilter
          list={window.employees}
          fieldName='Співробітник, що іде у відпустку'
          value={{name: employeeName, id: employeeId}}
          onChange={onEmployeeChange}
          disabled={false}
        />
      </If>
      <hr />
      <SelectorWithFilter
        list={window.employees}
        fieldName='Виконуючий обов’язки (на час вашої відсутності усі документи та накази перейдуть до в.о.)'
        value={{name: actingName, id: actingId}}
        onChange={onActingChange}
        disabled={false}
      />
      <hr />
      <div className='d-flex justify-content-between'>
        <SubmitButton className='btn-info' text='Зберегти' onClick={postVacation} disabled={!fieldsAreValid()} requestSent={request_sent} />
        <If condition={id !== 0}>
          <SubmitButton className='btn-outline-danger' text={props.vacation.started ? 'Закінчити' : 'Видалити'} onClick={delVacation} />
        </If>
      </div>
    </>
  );
}

Vacation.defaultProps = {
  vacation: {id: 0},
  reloadVacations: () => {}
};

export default Vacation;
