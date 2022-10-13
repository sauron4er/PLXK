'use strict';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex, notify, notifySuccess} from 'templates/components/my_extras';
import {axiosGetRequest} from 'templates/components/axios_requests';

function VacationsAdminTable(props) {
  return (
    <table className='table table-sm table-striped table-bordered'>
      <thead>
        <tr>
          <th className='text-center'>
            <small>Початок</small>
          </th>
          <th className='text-center'>
            <small>Кінець</small>
          </th>
          <th className='text-center'>
            <small>П.І.Б.</small>
          </th>
          <th className='text-center'>
            <small>В.о.</small>
          </th>
        </tr>
      </thead>
      <tbody>
        <For each='vacation' index='idx' of={props.vacations}>
          <tr key={idx} className={vacation.started && !vacation.finished ? 'bg-success' : ''} onClick={(e) => props.onClick(idx)}>
            <td className='text-center align-middle small'>{vacation.begin_table}</td>
            <td className='text-center align-middle small'>{vacation.end_table}</td>
            <td className='text-center align-middle small'>{vacation.employee_name}</td>
            <td className='text-center align-middle small'>{vacation.acting_name}</td>
          </tr>
        </For>
      </tbody>
    </table>
  );
}

VacationsAdminTable.defaultProps = {
  vacations: [],
  onClick: () => {}
};

export default VacationsAdminTable;
