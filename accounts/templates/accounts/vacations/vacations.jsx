'use strict';
import React, {useState, useLayoutEffect, useEffect} from 'react';
import Vacation from 'accounts/templates/accounts/vacations/vacation';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
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
  const [showAll, setShowAll] = useState(false);

  useLayoutEffect(() => {
    setVacations(window.vacations);
    filterVacations(window.vacations);
  }, []);

  useEffect(() => {
    reloadVacations();
  }, [withArchive, showAll]);

  function filterVacations(vacations) {
    if (!showAll) {
      let vacations_employee = [];
      let vacations_acting = [];

      vacations.map((vacation) => {
        if (vacation.user_is_acting) vacations_acting.push(vacation);
        else vacations_employee.push(vacation);
      });

      setVacationsEmployee(vacations_employee);
      setVacationsActing(vacations_acting);
    }
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
    formData.append('show_all', showAll);

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
    axiosGetRequest('arrange_vacations')
      .then((response) => {
        
        if (response === 'ok') {
          notifySuccess("Відпустки опрацьовано.");
          reloadVacations();
        }
      })
      .catch(function (error) {
        console.log(error);
        notify('Не вдалося зберегти дані. Зверніться до адміністратора');
      });
  }

  function onArchiveCheckboxClick() {
    setWithArchive(!withArchive);
  }

  function onShowAllCheckboxClick() {
    setShowAll(!showAll);
  }

  return (
    <>
      <div className='d-flex'>
        <div className='col-lg-5'>
          <Vacation vacation={clickedVacation} reloadVacations={reloadVacations} />
        </div>
        <div className='col-lg-7'>
          <h5>Ваші відпустки</h5>
          <div>
            <input id='archive_checkbox' type='checkbox' checked={withArchive} onChange={onArchiveCheckboxClick} />
            <label className='ml-1' htmlFor='archive_checkbox'>
              Показати архів
            </label>
          </div>
          <If condition={window.is_admin || window.is_hr}>
            <div>
              <input id='show_all_checkbox' type='checkbox' checked={showAll} onChange={onShowAllCheckboxClick} />
              <label className='ml-1' htmlFor='show_all_checkbox'>
                Показати відпустки всіх співробіників
              </label>
            </div>
          </If>
          <Choose>
            <When condition={!showAll}>
              <If condition={vacationsEmployee.length > 0}>
                <VacationsEmployeeTable vacations={vacationsEmployee} onClick={onEmployeeTableRowClick} />
                <button type='button' className='btn btn-sm btn-outline-secondary' onClick={startVacationsArrange}>
                  Опрацювати відпустки
                </button>
              </If>
              <If condition={vacationsActing.length > 0}>
                <hr />
                <h5>Відпустки інших працівників, в яких ви в.о.</h5>
                <VacationsActingTable vacations={vacationsActing} acting={true} onClick={onActingTableRowClick} />
              </If>
            </When>
            <Otherwise>
              <If condition={vacations.length > 0}>
              <VacationsAdminTable vacations={vacations} onClick={onAdminTableRowClick} />
              <button type='button' className='btn btn-sm btn-outline-secondary' onClick={startVacationsArrange}>
                Опрацювати відпустки
              </button>
              </If>
            </Otherwise>
          </Choose>
        </div>
      </div>
    </>
  );
}

export default Vacations;
