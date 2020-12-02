'use strict';
import * as React from 'react';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {Collapse} from 'react-collapse';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {ToastContainer, toast} from 'react-toastify';
import {getIndex} from 'templates/components/my_extras';
import querystring from 'querystring';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class UserVacation extends React.Component {
  state = {
    add_vacation_area: false,
    vacations: this.props.user.vacations,
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
    if (this.isVacationValid()) {
      const {vacations, begin, end, acting, acting_id} = this.state;

      const new_vacation = {
        id: 0,
        employee: this.props.user.id,
        begin: begin,
        end: end,
        acting_id: acting_id,
        acting: acting
      };
      vacations.push(new_vacation);

      this.setState({
        vacations: vacations,
        begin: '',
        end: '',
        acting_id: 0,
        acting: '',
        add_vacation_area: false
      });

      this.postNewVacation(new_vacation);
    }
  };
  
  isVacationEnded = () => {
    const {end} = this.state;
    const today = new Date();
    const today_year = today.getFullYear();
    const today_month = today.getMonth() > 9 ? today.getMonth() + 1 : '0' + (today.getMonth() + 1);
    const today_date = today.getDate() > 9 ? today.getDate() + 1 : '0' + (today.getDate() + 1);
    const today_string = today_year + '-' + today_month + '-' + today_date;
    
    return end < today_string;
  };

  isVacationValid = () => {
    const {begin, end, acting_id} = this.state;
    const {user} = this.props;

    if (!begin || !end || !acting_id) {
      this.notify('Заповніть всі поля.');
      return false
    }
    if (begin >= end) {
      this.notify('Дата виходу у відпустку не може бути меншою за дату повернення.');
      return false
    }
    if (this.isVacationEnded()) {
      this.notify('Ви намагаєтесь додати відпустку, яка вже завершилася.');
      return false
    }
    if (user.id === parseInt(acting_id)) {
      this.notify('Виконуючим обов’язки не може бути людина, яка йде у відпустку.');
      return false
    }
    return true
  };

  postNewVacation = (new_vacation) => {
    axios({
      method: 'post',
      url: 'new_vacation/',
      data: querystring.stringify({
        id: new_vacation.id,
        employee: new_vacation.employee,
        begin: new_vacation.begin,
        end: new_vacation.end,
        acting: new_vacation.acting_id
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        const {vacations} = this.state;
        for (const vacation of vacations) {
          if (vacation.id === 0) {
            vacation.id = response.data;
            break;
          }
        }
        this.setState({vacations});
      })
      .catch((error) => {
        console.log(error);
      });
  };

  delVacation = (e, id) => {
    e.preventDefault();

    const {vacations} = this.state;
    const index = getIndex(id, vacations);
    vacations.splice(index, 1);
    this.setState({vacations});

    this.postDeactivateVacation(id);
  };

  postDeactivateVacation = (vacation_id) => {
    axios({
      method: 'post',
      url: 'deactivate_vacation/' + vacation_id + '/',
      data: querystring.stringify({
        id: vacation_id
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const {add_vacation_area, vacations, acting, begin, end} = this.state;
    return (
      <>
        <hr />
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
                  <th> </th>
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
        <button
          className='btn btn-sm btn-outline-secondary mb-2'
          onClick={this.vacationAreaArrange}
        >
          {add_vacation_area ? 'Відмінити' : 'Додати відпустку'}
        </button>
        <If condition={vacations.length > 0}>
          <div>Заплановані відпустки:</div>
          <table className='table table-sm table-striped table-bordered'>
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
                <th className='text-center'> </th>
              </tr>
            </thead>
            <tbody>
              <For each='vacation' index='idx' of={vacations}>
                <tr key={idx} className={vacation.started ? 'bg-success' : ''}>
                  <td className='text-center align-middle small'>{vacation.begin}</td>
                  <td className='text-center align-middle small'>{vacation.end}</td>
                  <td className='text-center align-middle small'>{vacation.acting}</td>
                  <td className='text-center align-middle small text-danger'>
                    <button
                      className='btn btn-sm btn-link py-0'
                      onClick={(e) => this.delVacation(e, vacation.id)}
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
    user: {},
    emps: []
  };
}

export default UserVacation;
