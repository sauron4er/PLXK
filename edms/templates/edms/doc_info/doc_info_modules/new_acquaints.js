'use strict';
import React from 'react';
import axios from 'axios';
import {toast} from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

class NewAcquaints extends React.Component {
  state = {
    emp_seats: [],
    acquaints: [],
    emp_seat_id: '0',
    emp_seat: ''
  };

  componentWillMount() {
    axios({
      method: 'get',
      url: 'get_emp_seats/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          emp_seats: response.data
        });
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  }

  onChange = (event) => {
    if (event.target.name === 'acquaint') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        emp_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
        emp_seat: event.target.options[selectedIndex].getAttribute('value')
      });
    } else {
      this.setState({[event.target.name]: event.target.value});
    }
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

  // заставляє батьківський компонент запостити позначку
  onClick = (e) => {
    e.preventDefault();
    this.props.onClick(this.state.acquaints);
  };

  // додає резолюцію у список резолюцій
  addAcquaint = () => {
    if (this.state.emp_seat_id !== '0') {
      const new_acquaint = {
        emp_seat_id: this.state.emp_seat_id,
        emp_seat: this.state.emp_seat
      };
      this.setState((prevState) => ({
        acquaints: [...prevState.acquaints, new_acquaint],
        emp_seat_id: '0',
        emp_seat: ''
      }));
    } else {
      this.props.notify('Оберіть адресата.');
    }
  };

  // видаляє резолюцію зі списку
  delAcquaint = (index) => {
    let acquaints = this.state.acquaints;
    acquaints.splice(index, 1);
    this.setState({acquaints: acquaints});
  };

  render() {
    const {emp_seat, acquaints, emp_seats} = this.state;
    return (
      <Choose>
        <When condition={emp_seats.length > 0}>
          <label htmlFor='acquaint-select'>На ознайомлення:</label>
          <select
            className='full_width'
            id='acquaint-select'
            name='acquaint'
            value={emp_seat}
            onChange={this.onChange}
          >
            <option data-key={0} value='Не внесено'>
              ------------
            </option>
            {emp_seats.map((emp_seat) => {
              return (
                <option
                  key={emp_seat.id}
                  data-key={emp_seat.id}
                  value={emp_seat.emp + ', ' + emp_seat.seat}
                >
                  {emp_seat.emp}, {emp_seat.seat}
                </option>
              );
            })}
          </select>
          <button className='mt-2 btn btn-outline-secondary' onClick={this.addAcquaint}>
            Додати
          </button>
          <If condition={acquaints.length > 0}>
            <ul className='mt-1'>
              {acquaints.map((acquaint, index) => {
                return (
                  <div key={index} className='d-flex align-items-start'>
                    <li>{acquaint.emp_seat}</li>
                    <button
                      className='btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1'
                      onClick={this.delAcquaint.bind(undefined, index)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                );
              })}
            </ul>
            <button className='btn btn-success' onClick={this.onClick}>
              Відправити
            </button>
          </If>
        </When>
        <Otherwise>
          <div className='mt-4 loader-small' id='loader-1'>
            {' '}
          </div>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    resolutions: []
  };
}

export default NewAcquaints;
