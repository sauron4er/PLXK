'use strict';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex, notify, notifySuccess} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';
import DateInput from 'templates/components/form_modules/date_input';
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";

function Vacation(props) {
  const [vacations, setVacations] = useState([]);
  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);
  const [actingId, setActingId] = useState([]);
  const [actingName, setActingName] = useState([]);
  
  function onActingChange(e) {
    setActingId(e.id);
    setActingName(e.name);
  };

  return (
    <>
      <h5>Нова відпустка / редагування відпустки</h5>
      <hr />
      <div className='d-flex'>
        <DateInput fieldName='Дата початку' date={start} disabled={false} onChange={(e) => setStart(e.target.value)} />
        <DateInput fieldName='Дата кінця' date={end} disabled={false} onChange={(e) => setEnd(e.target.value)} className='ml-3' />
      </div>
      <hr />
      
      {/*TODO замінити кружочок на три крапки, показувати їх не замість цілого компонента, а лише замість самого селекта*/}
      
      <SelectorWithFilterAndAxios
        listNameForUrl='employees'
        fieldName='В.о.'
        selectId='acting_select'
        value={{name: actingName, id: actingId}}
        onChange={onActingChange}
        disabled={false}
      />
    </>
  );
}

export default Vacation;
