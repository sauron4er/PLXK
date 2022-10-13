'use strict';
import React, { useState, useLayoutEffect, useEffect } from "react";
import Vacation from 'accounts/templates/accounts/vacations/vacation';
import { axiosGetRequest, axiosPostRequest } from "templates/components/axios_requests";
import {notify, notifySuccess} from 'templates/components/my_extras';
import VacationsEmployeeTable from 'accounts/templates/accounts/vacations/vacations_employee_table';
import VacationsActingTable from 'accounts/templates/accounts/vacations/vacations_acting_table';
import VacationsAdminTable from 'accounts/templates/accounts/vacations/vacations_admin_table';

function Vacations() {
  const [vacations, setVacations] = useState([]);
  const [vacationsEmployee, setVacationsEmployee] = useState([]);
  const [vacationsActing, setVacationsActing] = useState([]);
  const [clickedVacation, setClickedVacation] = useState({id: 0});
  const [withArchive, setWithArchive] = useState(false);

  useLayoutEffect(() => {
    setVacations(window.vacations);
    filterVacations(window.vacations);
  }, []);
  
  useEffect(() => {
    reloadVacations()
  }, [withArchive])

  function filterVacations(vacations) {
    let vacations_employee = [];
    let vacations_acting = [];

    vacations.map((vacation) => {
      if (vacation.user_is_acting) vacations_acting.push(vacation);
      else vacations_employee.push(vacation);
    });

    setVacationsEmployee(vacations_employee);
    setVacationsActing(vacations_acting);
  }

  function onEmployeeTableRowClick(index) {
    setClickedVacation(vacationsEmployee[index]);
  }
  
  function onActingTableRowClick() {
    const blank_vacation = {id: 0};
    setClickedVacation(blank_vacation);
  }

  function onAdminTableRowClick(index) {
    setClickedVacation(vacations[index]);
  }

  function reloadVacations() {
    let formData = new FormData();
    formData.append('with_archive', withArchive);
    
    axiosPostRequest('get_vacations', formData)
      .then((response) => {
        setVacations(response);
        filterVacations(response);
      })
      .catch(function (error) {
        console.log(error);
        notify('Щось пішло не так. Зверніться до адміністратора');
      });
  }

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
  
  function onCheckboxClick() {
    setWithArchive(!withArchive);
  }

  return (
    <>
      <div className='d-flex'>
        <div className='col-lg-6'>
          <h5>Ваші відпустки</h5>
          <div>
            <input id='archive_checkbox' type='checkbox' checked={withArchive} onChange={onCheckboxClick} />
            <label className='ml-1' htmlFor='archive_checkbox'>
              Показати архів
            </label>
          </div>
          <If condition={vacationsEmployee.length > 0}>
            <VacationsEmployeeTable vacations={vacationsEmployee} onClick={onEmployeeTableRowClick} />
          </If>
          <button type='button' className='btn btn-sm btn-outline-secondary' onClick={startVacationsArrange}>
            Опрацювати відпустки
          </button>
          <hr />
          <h5>Відпустки інших працівників, в яких ви в.о.</h5>
          <If condition={vacationsActing.length > 0}>
            <VacationsActingTable vacations={vacationsActing} acting={true} onClick={onActingTableRowClick} />
          </If>
        </div>
        <div className='col-lg-6'>
          <Vacation vacation={clickedVacation} reloadVacations={reloadVacations} />
        </div>
      </div>
    </>
  );
}

export default Vacations;
