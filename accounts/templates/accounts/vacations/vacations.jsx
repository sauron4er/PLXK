'use strict';
import React, {useState, useEffect} from 'react';
import VacationsTable from 'accounts/templates/accounts/vacations/vacations_table';
import Vacation from 'accounts/templates/accounts/vacations/vacation';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify, notifySuccess} from 'templates/components/my_extras';

function Vacations() {
  const [vacations, setVacations] = useState([]);
  const [clickedId, setClickedId] = useState(0);

  useEffect(() => {
    setVacations(window.vacations);
  }, []);

  function onRowClick(row) {}

  function reloadVacations() {}

  function startVacationsArrange() {
    axiosGetRequest('start_vacations_arrange')
      .then((response) => {
        if (response === 'ok') notifySuccess('Відпустки опрацьовано.');
      })
      .catch(function (error) {
        console.log(error);
        notify('Не вдалося зберегти дані. Зверніться до адміністратора');
      });
  }

  return (
    <>
      <div className='d-flex'>
        <div className='col-lg-6'>
          <h5>Ваші відпустки</h5>
          <VacationsTable vacations={vacations} />
          <button type='button' className='btn btn-sm btn-outline-secondary' onClick={startVacationsArrange}>
            Опрацювати відпустки
          </button>
          <hr/>
          <h5>Відпустки інших працівників, в яких ви в.о.</h5>
          <VacationsTable vacations={vacations} acting={true} />
        </div>
        <div className='col-lg-6'>
          <Vacation id={clickedId} reloadVacations={reloadVacations} />
        </div>
      </div>
    </>
  );
}

export default Vacations;
