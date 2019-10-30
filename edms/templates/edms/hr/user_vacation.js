'use strict';
import React from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {Collapse} from 'react-collapse';
import axios from 'axios';
import querystring from 'querystring'; // for axios

import DxTable from '../components/dx_table';
import {getIndex} from '../_else/my_extras.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {ToastContainer, toast} from 'react-toastify';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class UserVacation extends React.Component {
  state = {
    add_vacation_area: false,
    vacation_list: [],
    acting: '',
    acting_id: 0,
    begin: '',
    end: ''
  };

  // Спливаюче повідомлення
  notify = (message) =>
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });

  actingChange = (e) => {
    if (e.target.name === 'acting') {
      const selectedIndex = document.getElementById('acting-select').selectedIndex;
      this.setState({
        acting_id: e.target.options[selectedIndex].getAttribute('data-key'),
        acting: e.target.options[selectedIndex].getAttribute('value')
      });
    }
  };

  firstDayChange = (e) => {
    this.setState({begin: e.target.value});
  };

  lastDayChange = (e) => {
    this.setState({end: e.target.value});
  };

  vacationAreaArrange = (e) => {
    e.preventDefault();
    this.setState({
      add_vacation_area: !this.state.add_vacation_area,
      begin: '',
      end: '',
      acting_id: 0,
      acting: ''
    });
  };

  addVacation = (e) => {
    e.preventDefault();
    const {vacation_list, begin, end, acting} = this.state;

    if (!begin || !end || !acting) {
      this.notify('Заповніть всі поля');
    } else {
      vacation_list.push({
        begin: begin,
        end: end,
        acting: acting
      });

      this.setState({
        vacation_list: vacation_list,
        begin: '',
        end: '',
        acting_id: 0,
        acting: '',
        add_vacation_area: false
      });
    }
  };
  
  delVacation = (e, index) => {
    e.preventDefault();
    
    console.log(index);
  };

  render() {
    const {add_vacation_area, vacation_list, acting, begin, end} = this.state;
    return (
      <>
        <hr />
        {/*<If condition={add_vacation_area}>*/}
        <Collapse isOpened={add_vacation_area}>
          <div className='mb-3 bg-success p-2'>
            <span>Нова відпустка:</span>
            <table className='table table-sm'>
              <thead>
                <tr>
                  <th className='text-center'>
                    <small>Дата виходу у відпустку</small>
                  </th>
                  <th className='text-center'>
                    <small>Дата виходу на роботу</small>
                  </th>
                  <th className='text-center'>
                    <small>В.о.</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      className='form-control form-control-sm'
                      id='first_day'
                      name='first_day'
                      type='date'
                      value={begin}
                      onChange={this.firstDayChange}
                    />
                  </td>
                  <td>
                    <input
                      className='form-control form-control-sm'
                      id='last_day'
                      name='last_day'
                      type='date'
                      value={end}
                      onChange={this.lastDayChange}
                    />
                  </td>
                  <td>
                    <select
                      className='form-control form-control-sm'
                      id='acting-select'
                      name='acting'
                      value={acting}
                      onChange={this.actingChange}
                    >
                      <option data-key={0} value=''>
                        ------------
                      </option>
                      {this.props.emps.map((emp) => {
                        return (
                          <option key={emp.id} data-key={emp.id} value={emp.emp}>
                            {emp.emp}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className='btn btn-sm btn-light' onClick={this.addVacation}>
              Зберегти
            </button>
          </div>
        </Collapse>
        {/*</If>*/}
        <button
          className='btn btn-sm btn-outline-secondary mb-2'
          onClick={this.vacationAreaArrange}
        >
          {add_vacation_area ? 'Відмінити' : 'Додати відпустку'}
        </button>
        <If condition={vacation_list.length > 0}>
          <div>Заплановані відпустки:</div>
          <table className='table table-sm table-striped'>
            <thead>
              <tr>
                <th className='text-center'>
                  <small>Дата виходу у відпустку</small>
                </th>
                <th className='text-center'>
                  <small>Дата виходу на роботу</small>
                </th>
                <th className='text-center'>
                  <small>В.о.</small>
                </th>
                <th className='text-center'>
                  <small>
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </small>
                </th>
              </tr>
            </thead>
            <tbody>
              <For each='vacation' index='idx' of={vacation_list}>
                <tr key={idx}>
                  <td className='text-center small'>{vacation.begin}</td>
                  <td className='text-center small'>{vacation.end}</td>
                  <td className='text-center small'>{vacation.acting}</td>
                  <td className='text-center small text-danger'>
                    <button
                      className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                      onClick={(e) => this.delVacation(e, idx)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </td>
                </tr>
              </For>
            </tbody>
          </table>
        </If>
        <hr />
        <ToastContainer />
      </>
    );
  }

  static defaultProps = {
    emps: []
  };
}

export default UserVacation;
