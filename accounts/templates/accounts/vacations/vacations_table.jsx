'use strict';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex, notify, notifySuccess} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';

function VacationsTable(props) {
  const [vacations, setVacations] = useState([]);

  function getVacationsList() {
    axiosGetRequest('get_vacations')
      .then((response) => {
        this.setState({
          vacations_list: response.data
        });
      })
      .catch(function (error) {
        console.log(error);
        notify('Не вдалося отримати список відпусток. Зверніться до адміністратора');
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

  function delVacation(e, vacation_id) {
    e.preventDefault();
    const vacations_list = [...vacations];
    const index = getIndex(vacation_id, vacations_list);
    vacations_list.splice(index, 1);
    setVacations(vacations_list);
  }

  function deactivateVacation(vacation_id) {
    axiosGetRequest(`deactivate_vacation/${vacation_id}`)
      .then((response) => delVacation(vacation_id))
      .catch((error) => notify('Не вдалося зберегти дані. Зверніться до адміністратора'));
  }

  return (
    <>
      <div className='modal-body'>
        <Choose>
          <When condition={vacations.length > 0}>
            <table className='table table-sm table-striped table-bordered'>
              <thead>
                <tr>
                  <th className='text-center'>
                    <small>Початок</small>
                  </th>
                  <th className='text-center'>
                    <small>Кінець</small>
                  </th>
                  {/*<th className='text-center'>*/}
                  {/*  <small>Ф.І.О.</small>*/}
                  {/*</th>*/}
                  <th className='text-center'>
                    <small>В.о.</small>
                  </th>
                  <th className='text-center'></th>
                </tr>
              </thead>
              <tbody>
                <For each='vacation' index='idx' of={vacations}>
                  <tr key={idx} className={vacation.started ? 'bg-success' : ''}>
                    <td className='text-center align-middle small'>{vacation.begin}</td>
                    <td className='text-center align-middle small'>{vacation.end}</td>
                    {/*<td className='text-center align-middle small'>{vacation.employee}</td>*/}
                    <td className='text-center align-middle small'>{vacation.acting}</td>
                    <td className='text-center align-middle small text-danger'>
                      <button className='btn btn-sm btn-link py-0' onClick={(e) => deactivateVacation(e, vacation.id)}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                </For>
              </tbody>
            </table>
            <div className='modal-footer'>
              <If condition={true}>
                <button type='button' className='btn btn-sm btn-outline-secondary mb-1 float-left' onClick={startVacationsArrange}>
                  Опрацювати відпустки
                </button>
              </If>
            </div>
          </When>
          {/*<Otherwise>*/}
          {/*  <div>Відпусток не заплановано.</div>*/}
          {/*</Otherwise>*/}
        </Choose>
      </div>
    </>
  );
}

export default VacationsTable;
