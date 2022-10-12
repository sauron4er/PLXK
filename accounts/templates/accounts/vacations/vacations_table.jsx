'use strict';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex, notify, notifySuccess} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';

function VacationsTable(props) {
  console.log(props.vacations);

  return (
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
              <If condition={window.is_admin || window.is_hr}>
                <th className='text-center'>
                  <small>П.І.Б.</small>
                </th>
              </If>
              <th className='text-center'>
                <small>В.о.</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <For each='vacation' index='idx' of={vacations}>
              <tr key={idx} className={vacation.started ? 'bg-success' : ''}>
                <td className='text-center align-middle small'>{vacation.begin}</td>
                <td className='text-center align-middle small'>{vacation.end}</td>
                <If condition={window.is_admin || window.is_hr}>
                  <td className='text-center align-middle small'>{vacation.employee_name}</td>
                </If>
                <td className='text-center align-middle small'>{vacation.acting_name}</td>
              </tr>
            </For>
          </tbody>
        </table>
      </When>
      <Otherwise>
        <div>Відпусток не заплановано.</div>
      </Otherwise>
    </Choose>
  );
}

VacationsTable.defaultProps = {
  vacations: []
};

export default VacationsTable;
